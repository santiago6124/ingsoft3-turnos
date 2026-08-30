# Sistema de Turnos — versión A (demo de conflicto)

[![CI](https://github.com/santiago6124/ingsoft3-turnos/actions/workflows/ci.yml/badge.svg)](https://github.com/santiago6124/ingsoft3-turnos/actions/workflows/ci.yml)

Mini sistema de gestión de turnos (inspirado en la Dirección Nacional de Migraciones): un
ciudadano pide un turno para un trámite en un horario habilitado, y un operador lo confirma o lo
cancela. Es **la app del semestre** de Ingeniería del Software 3: sobre ella se construye, TP a TP,
el sistema de entrega completo (contenedores, CI, tests, CD, IaC, seguridad, observabilidad).

| Capa | Tecnología |
|---|---|
| Backend | ASP.NET Core 8 (Web API) · EF Core · Npgsql · Swagger |
| Frontend | React 18 + TypeScript · Vite · servido por nginx en el contenedor |
| Base de datos | PostgreSQL 16 |
| Contenedores | Docker + Docker Compose (imágenes en `ghcr.io/santiago6124`) |

> La aplicación está adaptada de [valselviz/turnos-system](https://github.com/valselviz/turnos-system)
> (Valeria Selviz). Los cambios propios están documentados en [`decisiones.md`](decisiones.md).

## Estructura

```
.
├── backend/                     # solución .NET (Turnos.sln)
│   ├── Turnos.Api/              # API REST: controllers, EF Core, migraciones
│   ├── Turnos.Api.Tests/        # tests xUnit
│   ├── Dockerfile               # multi-stage: sdk:8.0 → aspnet:8.0
│   └── .dockerignore
├── frontend/                    # SPA React + Vite
│   ├── src/
│   ├── Dockerfile               # multi-stage: node:20-alpine → nginx:alpine
│   ├── nginx.conf               # sirve la SPA y proxea /api al backend
│   └── .dockerignore
├── docker-compose.yml           # levanta db + backend + frontend construyendo las imágenes
├── docker-compose.registry.yml  # igual, pero BAJA las imágenes publicadas en ghcr.io
├── .env.example                 # plantilla del secreto (copiar a .env)
├── decisiones.md                # decisiones y justificaciones, TP a TP
└── evidencias.md                # evidencias de cada TP
```

## Arranque desde cero (con Docker)

Requisitos: Git y Docker con el plugin Compose (Docker Desktop, o `colima` + `docker` en macOS).

```bash
git clone https://github.com/santiago6124/ingsoft3-turnos.git
cd ingsoft3-turnos

cp .env.example .env        # 1) el secreto NO viaja en el repo: creá el .env y poné tu contraseña
docker compose up -d --build   # 2) construye las dos imágenes y levanta db + backend + frontend
docker compose ps           # esperá a ver db "healthy" y backend/frontend "running"
```

Son **dos** comandos y no uno a propósito: la contraseña de la base es lo único que no puede vivir
en el repositorio.

| Qué | URL |
|---|---|
| Aplicación (SPA) | http://localhost:3000 |
| API — Swagger | http://localhost:8080/swagger |
| API — health check | http://localhost:8080/health |

El backend aplica las migraciones de EF Core al arrancar, así que la base nace con el esquema listo.

```bash
docker compose down        # apaga; los datos quedan en el volumen db_data
docker compose down -v     # apaga Y borra el volumen: la base vuelve a cero
```

### Levantar sin el código: las imágenes publicadas

`docker-compose.registry.yml` es el mismo compose, pero en vez de construir baja
`ghcr.io/santiago6124/turnos-backend:v0.1.1` y `ghcr.io/santiago6124/turnos-frontend:v0.1.1`
(públicas). Necesita el mismo `.env`:

```bash
cp .env.example .env
docker compose -f docker-compose.registry.yml up -d
```

> Las imágenes se construyeron en una Mac con chip Apple (arm64). En una máquina x86
> el `pull` falla con `no matching manifest for linux/amd64`; el build multi-arquitectura se
> resuelve en el TP7.

## Desarrollo local (sin contenerizar la app)

Requisitos: .NET 8 SDK, Node.js 20+, y un PostgreSQL. Lo más simple es usar solo la base del compose:

```bash
cp .env.example .env
docker compose up -d db                # solo PostgreSQL, en localhost:5432

# Backend → http://localhost:5080 (Swagger en /swagger)
cd backend
ConnectionStrings__AppointmentsDb="Host=localhost;Port=5432;Database=turnos_db;Username=postgres;Password=$(grep DB_PASSWORD ../.env | cut -d= -f2)" \
  dotnet run --project Turnos.Api

# Frontend → http://localhost:5173 (Vite proxea /api al backend en 5080)
cd frontend
npm install
npm run dev
```

La connection string por defecto está en `backend/Turnos.Api/appsettings.json`
(`ConnectionStrings:AppointmentsDb`) y **se pisa con la variable de entorno**
`ConnectionStrings__AppointmentsDb` — así la misma app apunta a `localhost`, a `db` (compose) o a
la base de QA/PROD sin tocar código.

Tests del backend:

```bash
cd backend && dotnet test Turnos.sln
```

## Reglas de negocio

1. **No puede haber más de un turno confirmado en el mismo horario para el mismo trámite.** Se
   valida en `PUT /api/turnos/{id}/confirmar` y, como red de seguridad ante condiciones de carrera,
   hay un índice único parcial en la base (`ScheduledAt` + `ServiceType`, solo filas `Confirmed`).
2. **Un turno solo puede cancelarse si está pendiente o confirmado.** `PUT /api/turnos/{id}/cancelar`
   rechaza con 400 si ya está cancelado.
3. **La fecha/hora debe ser futura al crear el turno.** `POST /api/turnos` rechaza con 400 si no lo es.
4. **El turno debe caer en un horario habilitado**: lunes a viernes, de 09:00 a 16:00, en slots de 15
   minutos (configurable en `appsettings.json`, sección `BusinessHours`). Si el slot ya tiene un turno
   confirmado del mismo trámite, la creación se rechaza con 409. Ver `Services/ScheduleService.cs`.

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/health` | Health check (`{"status":"ok"}`) |
| `POST` | `/api/turnos` | Crea un turno. Body: `citizenName`, `nationalId`, `scheduledAt`, `serviceType` |
| `GET` | `/api/turnos` | Lista turnos. Filtros opcionales: `status`, `date`, `serviceType`, `search` |
| `PUT` | `/api/turnos/{id}/confirmar` | Confirma un turno pendiente |
| `PUT` | `/api/turnos/{id}/cancelar` | Cancela un turno pendiente o confirmado |
| `GET` | `/api/available-slots?date=2026-09-01&serviceType=Pasaporte` | Slots del día para ese trámite, marcando los ocupados |

En el contenedor, el frontend llama a `/api/...` con ruta relativa y nginx lo reenvía al servicio
`backend` por la red interna de compose (mismo origen: sin CORS).
