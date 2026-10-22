# Decisiones

Registro de decisiones del semestre. Cada TP agrega su sección abajo de la anterior.

## Enlaces de P2 (TPs 5 a 9)

| | Enlace |
|---|---|
| **QA** | front https://turnos-front-qa-eo7o.onrender.com · api https://turnos-api-qa-ga8a.onrender.com |
| **PROD** | front https://turnos-front-prod-49p5.onrender.com · api https://turnos-api-prod-rowo.onrender.com |
| Paquetes (TP6) | [backend](https://github.com/santiago6124/ingsoft3-turnos/pkgs/container/ingsoft3-turnos-backend) · [frontend](https://github.com/santiago6124/ingsoft3-turnos/pkgs/container/ingsoft3-turnos-frontend) |
| Cadena del TP6 | [PR con «Entrar al registry» salteado](https://github.com/santiago6124/ingsoft3-turnos/actions/runs/39447828299/job/118714336743) · [corrida de `main`, publicar último](https://github.com/santiago6124/ingsoft3-turnos/actions/runs/39448080594/job/118715217493) |
| Gate del TP6 | [rechazada](https://github.com/santiago6124/ingsoft3-turnos/actions/runs/39601462355) · [aprobada](https://github.com/santiago6124/ingsoft3-turnos/actions/runs/39606647929) |
| TP5 | [PR #31, la secuencia](https://github.com/santiago6124/ingsoft3-turnos/pull/31) · [PR #32, frenado hasta la defensa](https://github.com/santiago6124/ingsoft3-turnos/pull/32) |

### Enlaces del TP7

| | Enlace |
|---|---|
| Paquetes (etiquetas `sha-<commit>`) | [backend](https://github.com/santiago6124/ingsoft3-turnos/pkgs/container/ingsoft3-turnos-backend) · [frontend](https://github.com/santiago6124/ingsoft3-turnos/pkgs/container/ingsoft3-turnos-frontend) |
| El commit que **rompió el front** (sin tocar `e2e/`) | [`263e198`](https://github.com/santiago6124/ingsoft3-turnos/commit/263e198290966e224826536195a4373e5f644fe6) ([PR #44](https://github.com/santiago6124/ingsoft3-turnos/pull/44)) |
| La corrida **integración verde · e2e roja · PROD sin tocar** | https://github.com/santiago6124/ingsoft3-turnos/actions/runs/39707682856 |
| Sus dos reportes | [`playwright-report-integracion` (verde)](https://github.com/santiago6124/ingsoft3-turnos/actions/runs/39707682856/artifacts/12394799085) · [`playwright-report-e2e` (rojo)](https://github.com/santiago6124/ingsoft3-turnos/actions/runs/39707682856/artifacts/12396291174) |
| La corrida **completa en verde** posterior, hasta PROD | https://github.com/santiago6124/ingsoft3-turnos/actions/runs/39709526903 (arreglo, [PR #45](https://github.com/santiago6124/ingsoft3-turnos/pull/45)) |
| Release | [`v7.0.0`](https://github.com/santiago6124/ingsoft3-turnos/releases/tag/v7.0.0) → `ec2fd73` → `…:sha-ec2fd7393cf0aff1e16710e355c2a85d3fbba866` |

Los reportes vencen el 05/11/2026. Los *Events* de Render no son públicos: los muestro en vivo en la defensa.

Los entornos son del plan free de Render: la primera visita después de un rato tarda hasta un minuto
en despertar. El detalle de cada TP está en su sección.

## Nota sobre el proceso y el historial

El historial de este repositorio muestra que **catorce de los quince commits entraron el martes
25/08 entre las 18:15 y las 20:23**, y conviene decirlo acá antes de que lo pregunten: los cuatro
prácticos se hicieron en una sola sesión de trabajo, no una semana por práctico.

Cómo fue realmente: los TPs 1 a 4 ya estaban publicados cuando arranqué, así que los hice
**en orden y de corrido**, cada uno apoyándose en el anterior — el TP2 sobre el repo protegido del
TP1, el TP4 sobre los Dockerfiles del TP2. La sesión fue asistida con IA (Claude Code), declarado en
detalle en la sección de cada práctico, con la IA operando `git`, `gh` y `docker` bajo mi indicación
y yo verificando cada salida antes de seguir. Eso explica el ritmo: lo que llevó tiempo no fue
teclear los comandos, sino leer los cuatro enunciados, elegir la app del semestre contra los cinco
criterios, y entender qué estaba haciendo cada paso.

No lo presento como la forma recomendada de cursar. La materia está diseñada para que cada práctico
tome una semana, y trabajar así concentra el riesgo: si algo se rompía, no había margen. Lo que sí
sostengo es lo que la cátedra pide que se sostenga — **poder explicar cada decisión**: por qué `main`
está protegida así, por qué el Dockerfile tiene dos etapas, por qué el sprint dura dos semanas, por
qué el límite de trabajo en progreso es dos, y qué frena y qué destraba un merge. Los problemas que
aparecieron en el camino están contados en la sección «Problemas encontrados» de cada práctico, con
el error concreto y cómo se resolvió; no están puestos de adorno.

El repositorio siguió recibiendo trabajo después de esa sesión. El **domingo 30/08** entraron cinco
commits más, y ninguno es de relleno:

- El arreglo del renderizado de `evidencias.md`, un bug que sólo se veía mirando el archivo en
  GitHub y no en el editor (contado en el TP1 §2).
- El montaje de **vitest** en el frontend, que no tenía runner ni un solo test, con ocho tests sobre
  la lógica de `src/format.ts` — el agrupamiento del DNI, su dígito verificador y el caso borde en
  que la cantidad de dígitos es múltiplo de tres.
- El **arreglo del bug del issue #10**, el que yo mismo había registrado en el TP3: cuando fallaba
  la carga, la lista afirmaba «No hay turnos agendados», que es mentira — sí había, no se pudieron
  traer. Va con cuatro tests, y el principal **falla contra el código anterior**: ésa es la
  diferencia entre un test de regresión y un test decorativo.
- La publicación de **`v0.1.1`** con ese arreglo, porque las imágenes `v0.1.0` seguían teniendo el
  bug y son las que levanta el compose del registry.

Los tests **no se agregaron al pipeline** a propósito: el enunciado del TP4 dice que eso es el TP5.
Corren con `npm test` y quedan listos para cuando el pipeline los tenga que ejecutar.

## TP1 — Git colaborativo

### 1. Por qué Git no pudo resolver el conflicto solo

Las ramas `feature/titulo-a` y `feature/titulo-b` nacieron del **mismo commit** de `main`
(`6061db4`, el que ya tenía la sección *Instalación* del PR #1), y las dos cambiaron **la misma
línea** del `README.md` —la primera, el título— con textos distintos:

| | Línea 1 del `README.md` |
|---|---|
| Ancestro común (`6061db4`) | `# ingsoft3-turnos` |
| `main` después de mergear A (`d965633`) | `# Proyecto IngSoft3 - versión A` |
| `feature/titulo-b` | `# Proyecto IngSoft3 - versión B` |

Cuando el PR #2 (versión A) entró a `main`, GitHub marcó el PR #3 como `CONFLICTING`. Al hacer
`git merge origin/main` parado en `feature/titulo-b`, Git hizo un merge de tres vías: comparó cada
punta contra el ancestro común. Las dos habían modificado la misma línea respecto del ancestro, y de
forma distinta. Git compara texto, no entiende qué significa; no hay ninguna regla mecánica que le
permita decidir si el título correcto es "versión A" o "versión B", porque esa respuesta no está en
los archivos: está en la cabeza del equipo. Por eso dejó las dos versiones entre marcadores
(`<<<<<<< HEAD`, `=======`, `>>>>>>> origin/main`) y devolvió la decisión a una persona.

La prueba de que el criterio es "misma línea" y no "mismo archivo" está en la evidencia 3: la
sección `## Instalación`, en el mismo archivo, **se fusionó sola**, porque ninguna de las dos ramas la
tocó.

**Qué habría tenido que pasar para que nunca apareciera:**

1. **Integrar antes.** Si `feature/titulo-b` se hubiera creado *después* de mergear la A (o hubiera
   hecho `git pull` de `main` antes de tocar el título), habría partido de un `main` que ya decía
   "versión A" y su cambio habría sido secuencial, no paralelo. Es la razón por la que se insiste con
   ramas cortas e integración frecuente: los conflictos no desaparecen, pero quedan chicos.
2. **Que las dos ramas no tocaran la misma línea.** Si el trabajo se reparte por zona del archivo,
   Git fusiona sin preguntar.
3. **Decidir antes de escribir.** El conflicto es el síntoma; la causa es que dos "personas" tomaron
   la misma decisión (cómo se llama el proyecto) por separado.

### 2. Problemas encontrados y cómo se resolvieron

- **Los primeros PRs no se crearon.** El primer intento usó `gh pr create --json number`, y ese
  flag no existe para `pr create` (sí para `pr view`/`pr list`). El comando falló, pero el error
  quedó tapado por el `|| gh pr list ...` de respaldo, así que las tres ramas se pushearon sin PR y
  los merges siguientes no encontraron nada que mergear. Se detectó porque `main` seguía en el commit
  del `.gitignore`. Solución: se borraron las ramas A y B (locales y remotas), se creó el PR #1 con
  `gh pr create --head feature/seccion-instalacion` sobre la rama ya subida, se mergeó, y recién
  después se volvieron a crear A y B **desde el `main` actualizado** — que además deja el ejercicio
  más limpio: el ancestro común de las dos ya incluye la sección de instalación.
- **`mergeable: UNKNOWN` justo después de mergear A.** GitHub recalcula el estado de los otros PRs de
  forma asíncrona; el primer `gh pr view` puede devolver `UNKNOWN`. Se resolvió consultando en un
  bucle hasta que devolvió `CONFLICTING`. Es el mismo "esperá unos segundos" que la guía menciona para
  la web.
- **El conflicto se resolvió por consola, no desde la web.** La guía lo hace con *Resolve conflicts*
  en GitHub; acá se hizo con `git merge origin/main` en la rama B, editando el archivo y commiteando
  la resolución (`fix: resuelve conflicto de título tomando la versión B`). Los marcadores son los
  mismos; cambia el nombre que aparece al lado: `HEAD` es la rama en la que uno está parado.
- **El tag `v1.0.0` se creó antes de que existieran estos dos archivos.** Se siguió el orden de la
  guía (§4.7 tag y release, §4.8 los archivos), y eso deja al tag apuntando a un commit sin la
  entrega. Como el reglamento (§3) indica, se movió el tag al commit que sí la incluye con
  `git tag -f v1.0.0 && git push -f origin v1.0.0`, y queda registrado acá. La release `v1.0.0`
  sigue asociada al tag, por lo que pasa a mostrar el commit nuevo.
- **`evidencias.md` se veía bien en el editor y mal en GitHub.** La evidencia del conflicto muestra el
  `README.md` en conflicto, y ese README **contiene a su vez** un bloque de código (el `git clone` de
  la sección *Instalación*). Al pegarlo dentro de un bloque de tres backticks, el bloque de adentro
  cerró al de afuera antes de tiempo y **desalineó todos los bloques siguientes del archivo**: de la
  línea 60 en adelante la prosa se renderizaba como código y el código como prosa, y el archivo
  terminaba con un bloque sin cerrar. En el editor local no se nota — se ve mirando el archivo *en
  GitHub*. Se arregló usando fences de **cuatro** backticks en el bloque de afuera, que dejan al de
  tres adentro como contenido literal. Aprovechando el mismo cambio, la evidencia del gate del TP4 se
  partió en subsecciones reales en vez de un único bloque de 47 líneas. Como esto corrige archivos ya
  etiquetados, se movió el tag `v4.0.0` al commit corregido (`git tag -f` + `git push -f`), igual que
  se había hecho con `v1.0.0`.
- **La máquina no tenía Docker ni .NET.** Como la app del semestre es .NET 8 y desde la clase 2 hace
  falta Docker, se instalaron `dotnet@8` (Homebrew) y Docker vía `colima` + `docker` CLI +
  plugins `compose` y `buildx`, en lugar de Docker Desktop. Es funcionalmente equivalente para todo
  lo que pide la materia (`docker compose`, `docker build`, registry) y no necesita interfaz gráfica.

### 3. Declaración de uso de IA

**Todo el TP1 fue ejecutado con asistencia de IA**: se usó Claude Code (modelo Claude Fable 5)
operando `git` y `gh` desde la terminal bajo mi indicación, incluyendo la creación del repositorio,
la protección de `main` vía API (`enforce_admins: true`, 0 aprobaciones), los tres PRs, la fabricación
y resolución del conflicto, el tag, la release, y la redacción de este archivo y de `evidencias.md`.

Cómo se verificó lo que la IA hizo:
- Cada paso dejó salida de terminal que se revisó (el rechazo `GH006`, el JSON del PR #3 con
  `mergeable: CONFLICTING`, el `README.md` con los marcadores, el `git log` final).
- El estado se contrastó contra GitHub: *Settings → Branches* muestra la regla sobre `main`; los PRs
  #1, #2 y #3 figuran mergeados con squash; el tag y la release aparecen en *Releases*.
- El error del `--json` en `gh pr create` lo cometió la IA y también lo detectó ella al ver que
  `main` no avanzaba; queda documentado arriba porque es parte del proceso real.

Lo que se defiende en P1 no es el procedimiento sino su comprensión: qué protege la regla de
`main`, por qué el autor no puede aprobar su propio PR, qué es una rama para Git, por qué el merge
de tres vías se detuvo, y qué significa `v1.0.0` en semver.

---

## TP2 — Contenedores: la app del semestre

### 1. Qué app elegí y por qué

**Sistema de turnos** (trámites de la Dirección Nacional de Migraciones), adaptada de
[`valselviz/turnos-system`](https://github.com/valselviz/turnos-system): ASP.NET Core 8 + React 18/Vite +
PostgreSQL 16. Contra los cinco criterios de [`elegir-app.md`](https://github.com/ingsoft3ucc/TPs_2026/blob/main/elegir-app.md):

1. **Corre hoy.** Se clonó y se levantó completa antes de comprometerse. Requirió instalar el SDK de
   .NET 8 y Docker (ver más abajo), no tocar el código para que arrancara.
2. **Sé con qué se compila.** `dotnet publish` para el back y `npm run build` (Vite) para el front —
   que es exactamente lo que hay que escribir en un Dockerfile.
3. **La conexión a la base es parametrizable por variable de entorno sin tocar código.** Está en
   `backend/Turnos.Api/appsettings.json` bajo `ConnectionStrings:AppointmentsDb`, y .NET la pisa con
   `ConnectionStrings__AppointmentsDb` (el doble guión bajo anida claves). Es el criterio que más
   pesa: en este TP la misma app apunta a `localhost` en desarrollo y a `db` dentro de compose, y en
   el TP6 va a apuntar a la base de QA y a la de PROD **sin recompilar la imagen**.
4. **Tiene reglas de negocio de verdad, no solo ABM.** Cuatro, documentadas en el README: turno único
   confirmado por slot+trámite, cancelación solo desde pendiente/confirmado, fecha futura obligatoria,
   y slots válidos (L-V, 09:00–16:00, cada 15 min, configurables). Alcanzan de sobra para los 8 tests
   de backend del TP5 — de hecho el repo ya trae **18 tests xUnit** que pasan. En el frontend hay
   validación de formulario y cálculo de slots disponibles para los 4 tests que pide el TP5.
5. **La entiendo lo suficiente para modificarla.** En este mismo TP se le cambiaron las rutas de los
   controllers, se le agregó el endpoint `/health` y se cambió el modo en que el front resuelve la URL
   de la API (ver abajo).

**Tamaño**: chica a propósito — una entidad (`Appointment`), dos controllers, dos vistas. La guía
recomienda dos o tres pantallas: más grande solo significa builds más lentos y más puntos de falla.

**Qué le cambié al repo original** (y por qué, porque esto se defiende):

- **Rutas bajo `/api`**: los controllers eran `[Route("turnos")]` y `[Route("available-slots")]`.
  Pasaron a `api/turnos` y `api/available-slots` para que nginx pueda proxear un único prefijo `/api`
  al backend. Sin esto habría que listar cada ruta en el `nginx.conf`.
- **El frontend ahora usa una ruta relativa.** `src/api.ts` tenía
  `VITE_API_URL || 'http://localhost:5080'`: una URL absoluta horneada en el bundle, que obliga a
  reconstruir la imagen para cambiar de entorno y además genera CORS. Ahora el default es `/api`, que
  en desarrollo resuelve el proxy de Vite (`vite.config.ts`) y en el contenedor resuelve nginx. La
  imagen del front pasa a ser la misma para cualquier entorno — que es el punto del TP7.
- **Endpoint `/health`** en `Program.cs`: lo usan el healthcheck, el pipeline del TP4 y el monitoreo
  del TP9.
- **Swagger siempre activo**, no solo en `Development`: el compose original forzaba
  `ASPNETCORE_ENVIRONMENT=Development` solo para no perder Swagger, lo que también activa páginas de
  error con stack traces. Se prefirió dejar el entorno en su default (`Production`) y exponer Swagger
  explícitamente.
- **Se agregó `backend/Turnos.sln`**: la solución no estaba versionada, y el Dockerfile la necesita
  para copiar los `.csproj` antes del `restore` (la capa cacheable).
- **Se descartaron los Dockerfiles y el compose del repo original**, que existían pero no cumplían el
  contrato del TP: las credenciales de la base estaban escritas en el `docker-compose.yml`, no había
  `.env`/`.env.example`, no había `docker-compose.registry.yml` y el `nginx.conf` no proxeaba `/api`.

### 2. Decisiones de contenerización

**Imágenes base y multi-stage.** Los dos Dockerfiles tienen dos etapas, y la razón es la misma en
ambos: **lo que hace falta para construir no hace falta para ejecutar**.

| | Etapa de build | Etapa final | Tamaño |
|---|---|---|---|
| Backend | `mcr.microsoft.com/dotnet/sdk:8.0` (**1.25 GB**) | `mcr.microsoft.com/dotnet/aspnet:8.0` | **363 MB** |
| Frontend | `node:20-alpine` (**194 MB**) | `nginx:alpine` | **93 MB** |

El backend final pesa **3,4 veces menos** que la imagen que lo compiló: la final no lleva el
compilador, ni el SDK, ni el código fuente, ni los paquetes de NuGet — solo el `publish` y el runtime.
En el frontend la diferencia es aún más marcada en naturaleza: la imagen final **no tiene Node**, solo
nginx y un puñado de archivos estáticos. Menos superficie es menos peso y también menos vulnerabilidades
(lo vamos a medir en el TP9).

**El orden de las instrucciones no es estético, es el cache.** En los dos Dockerfiles se copian primero
los archivos de dependencias (`*.csproj` + `.sln`, `package*.json`) y se corre el `restore`/`npm ci`
**antes** de copiar el código. Así la capa de dependencias solo se rehace cuando cambian esos archivos:
un cambio de código no vuelve a bajar todos los paquetes. Es la misma propiedad que el TP4 explota en el
pipeline con `cache-from`/`cache-to`.

**`npm ci` y no `npm install`**: `ci` respeta el `package-lock.json` al pie de la letra y falla si está
desincronizado; `install` puede resolver versiones distintas y hacer que la imagen no sea reproducible.

**Dos `.dockerignore`, no uno.** Docker busca el archivo en la carpeta que se le pasa como contexto, y
acá hay dos contextos (`./backend` y `./frontend`). El del backend usa `**/bin/` y `**/obj/` con
asteriscos porque los artefactos están dentro de cada proyecto (`Turnos.Api/obj`), no en la raíz del
contexto; sin eso, el `COPY . .` mete el `obj/project.assets.json` generado en mi Mac —con rutas
absolutas mías— y pisa el que acaba de generar el `restore` de Linux. El del frontend excluye
`node_modules/` por una razón análoga: los binarios de Vite/esbuild son por plataforma, y copiar los de
macOS encima de los que instaló `npm ci` para Linux rompe el build.

**Qué persiste y qué no.** Solo la base de datos, en el volumen nombrado `db_data` montado en
`/var/lib/postgresql/data`. Los contenedores de backend y frontend son **descartables**: no guardan
estado, se pueden borrar y recrear sin perder nada. Por eso `docker compose down` conserva los datos
(borra contenedores, no volúmenes) y `docker compose down -v` los borra. Se eligió volumen nombrado y
no bind mount porque en macOS el directorio de datos de PostgreSQL sobre una carpeta del host pasa por
la VM de Docker: es más lento y trae problemas de permisos.

**`depends_on` con `condition: service_healthy`, no `depends_on` a secas.** `depends_on` solo garantiza
que el contenedor de la base **arrancó**, no que PostgreSQL esté aceptando conexiones — y el backend
aplica migraciones de EF Core en el arranque, así que si sale primero se muere con
`Failed to connect`. El `healthcheck` con `pg_isready` es lo que convierte "arrancó" en "está listo".

**El secreto por variable de entorno.** La contraseña de la base está en `.env` (ignorado por git) y el
repositorio solo lleva `.env.example`. Por eso el arranque documentado en el README son **dos** comandos
y no uno: `cp .env.example .env` y después `docker compose up -d`. En el TP4 esa variable pasa a ser un
secreto del repositorio, y en el TP6 una del entorno.

**El `nginx.conf` con el upstream en una variable.** `set $backend_api http://backend:8080;` +
`proxy_pass $backend_api;` en vez de escribir el nombre directo. Con el nombre directo, nginx resuelve el
DNS **al arrancar**, y si el contenedor `backend` todavía no existe se niega a levantar con
`host not found in upstream`. Con variable resuelve recién cuando llega un pedido, así que el frontend
puede arrancar solo. El `proxy_pass` va **sin barra final** a propósito: con barra, nginx reescribe el
prefijo y `/api/turnos` llegaría como `/turnos` al backend.

**Registry: ghcr.io.** Se eligió sobre Docker Hub porque la cuenta ya existe (es la del TP1), las
imágenes quedan junto al código, y en el TP7 el pipeline se va a poder autenticar contra ghcr con el
`GITHUB_TOKEN` del propio workflow, sin guardar ningún secreto. Ambas imágenes llevan
`LABEL org.opencontainers.image.source` apuntando a este repositorio para que queden enlazadas.

**Versiones publicadas**: `v0.1.0` fue la del cierre del TP2. Al arreglar el bug del issue #10 se
publicó `v0.1.1` y el `docker-compose.registry.yml` pasó a apuntar ahí — es exactamente lo que
significa el tercer número en semver: un arreglo compatible, sin cambios de API ni de configuración.
Las dos versiones siguen publicadas: la vieja no se borra, se deja de referenciar.

**⚠️ Arquitectura**: las imágenes se construyeron en una Mac con chip Apple, así que son
`linux/arm64`. En una máquina x86 el `pull` falla con `no matching manifest for linux/amd64`, y los
runners de GitHub Actions son x86 — por eso el pipeline del TP4 construye sus propias imágenes en el
runner en vez de bajar éstas. El build multi-arquitectura con `docker buildx` es tema del TP7.

### 2.b El health check comprueba su dependencia

El endpoint `/health` original devolvía `{"status":"ok"}` incondicionalmente: contestaba 200 aunque
la base estuviera caída. Eso no es un health check, es un «el proceso está vivo» — y es peligroso,
porque un orquestador lo lee como *sano* y le sigue mandando tráfico a una instancia que no puede
atender un solo pedido.

Ahora hace `CanConnectAsync()` contra la base y responde en consecuencia: **200** con
`{"status":"ok","database":"ok"}`, o **503** con `{"status":"degraded","database":"unreachable"}`.
La prueba está en `evidencias.md`: con la base arriba da 200, apagándola da 503, y al devolverla
vuelve a 200 sin reiniciar nada.

Es la misma clase de defecto que el bug del issue #10 —afirmar algo que no se comprobó— y por eso se
arregló igual: no adivinar, verificar.

### 3. Problemas encontrados y cómo se resolvieron

- **`global.json` fijaba un SDK que no tengo.** El repo original traía `"version": "8.0.422"`, y el SDK
  instalado por Homebrew es 8.0.130. `dotnet` se niega a hacer nada —ni siquiera `dotnet new`— con un
  mensaje que enumera los SDK instalados. Se bajó el piso a `8.0.100` dejando
  `"rollForward": "latestFeature"`, que acepta cualquier 8.0.x posterior. Mantener el archivo tiene
  sentido: fija la major/minor para que el pipeline y mi máquina compilen con la misma.
- **Heredocs escritos en el directorio equivocado.** Un `cd` dentro de un script hizo que varios
  archivos (`Dockerfile`, `nginx.conf`, `docker-compose.yml`) se intentaran crear con rutas relativas
  desde `backend/`, que no existían. Se detectó por los `no such file or directory` y se rehizo usando
  rutas absolutas. Anecdótico, pero es exactamente el tipo de error que en un pipeline se manifiesta
  como "anda en mi máquina y no en el runner".
- **Los packages de ghcr nacen privados y la API no permite cambiarlo.** `docker push` funciona y el
  package aparece, pero `docker pull` sin credenciales devuelve `unauthorized` (queda registrado en
  `evidencias.md`). El endpoint `PATCH /user/packages/container/{name}` devuelve **404**: GitHub no
  expone el cambio de visibilidad por API, hay que hacerlo desde
  *perfil → Packages → el package → Package settings → Change visibility → Public*. Es el tropiezo
  más común de esta sección y no hay forma de scriptearlo.
- **La máquina no tenía Docker ni .NET** (ver TP1). Se resolvió con `colima` en lugar de Docker
  Desktop: `brew install colima docker docker-compose docker-buildx`, `colima start`. Es un demonio de
  Docker corriendo en una VM Linux, sin interfaz gráfica ni licencia comercial. Todo lo que pide la
  materia (`docker build`, `docker compose`, buildx, registry) funciona igual.
- **Con colima, el proyecto tiene que vivir bajo `$HOME`.** Al verificar el arranque desde cero se
  clonó el repo en un directorio temporal de `mktemp -d` (que en macOS cae en `/var/folders/...`): los
  contenedores arrancaron, la SPA respondió 200, pero `/api` devolvía **502** y `/health` no contestaba
  nunca. No era la app: colima corre el demonio de Docker **dentro de una VM Linux** y sólo monta
  `$HOME` en ella, así que el contexto de build de una carpeta fuera de `$HOME` no llega completo.
  Repitiendo el mismo clon bajo `$HOME`, el sistema levanta perfecto. Es la misma clase de problema que
  el TP4 hace visible en el pipeline: **lo que no viaja al entorno donde se construye, no existe ahí** —
  con Docker Desktop no pasa porque monta más rutas por defecto.

### 4. Declaración de uso de IA

**Todo el TP2 fue ejecutado con asistencia de IA** (Claude Code, modelo Claude Fable 5), bajo mi
indicación: la búsqueda y evaluación de la app contra los cinco criterios, los dos Dockerfiles, los dos
`.dockerignore`, el `nginx.conf`, los dos compose, el `.env.example`, las adaptaciones al código de la
app, el README de arranque y este archivo.

Cómo se verificó:
- **El sistema se levantó de verdad y se probó end-to-end**: `docker compose up -d --build`, la SPA
  responde en el 3000, `/api` proxeado por nginx llega al backend, se creó y confirmó un turno, y se
  comprobaron dos reglas de negocio (409 por slot ocupado, 400 por día no hábil). Todo está en
  `evidencias.md` con la salida real.
- **La prueba de persistencia se corrió completa**: `down` → los datos siguen; `down -v` → la base
  vuelve vacía.
- **El compose del registry se probó de verdad**, borrando antes las imágenes locales y el cache de
  construcción (`--rmi local`, `docker rmi`, `docker builder prune -af`) para que la descarga fuera real
  y no un `Already exists`.
- **Los 18 tests del backend pasan** (`dotnet test`), lo que confirma que las adaptaciones al código no
  rompieron nada.
- Los tamaños de imagen que aparecen arriba salen de `docker images`, no de una estimación.

---

## TP3 — Planificación y trazabilidad

### 1. Duración del sprint y por qué

**Dos semanas.**

El calendario de la materia manda: cada TP está pensado para tomar una semana, y las defensas
agrupan bloques (P1 = TPs 1–4, P2 = TPs 5–9). Un sprint de **una** semana obligaría a cerrar y
replanificar en el mismo día en que se entrega el práctico, y cualquier semana con parcial de otra
materia lo dejaría vacío. Uno de **cuatro** semanas tapa el problema al revés: dos prácticos enteros
adentro del mismo sprint, sin ningún momento de corte para mirar si el ritmo alcanza.

Dos semanas entran exactamente dos TPs, que es la unidad natural de trabajo acá, y dejan un punto de
revisión cada quince días — frecuente para corregir el rumbo, espaciado como para que la ceremonia no
cueste más que el trabajo.

### 2. Límite de trabajo en progreso y por qué

**Dos**, en la columna *In Progress*.

La regla de arranque es *cantidad de personas + 1*, y acá la persona es una sola. El "+1" no es un
permiso para hacer dos cosas a la vez: es la **válvula** para cuando algo queda esperando algo que no
depende de mí — una corrida de CI de varios minutos, una respuesta de la cátedra, un servicio gratuito
que hay que verificar. En vez de mirar la pantalla, muevo una segunda tarjeta.

Con tres o más el límite deja de limitar: se convierte en un backlog paralelo, todo queda empezado y
nada terminado, que es exactamente lo que un límite de trabajo en progreso existe para evitar. La
señal de que quedó **demasiado alto** es no alcanzarlo nunca — si nunca me frena, no está midiendo
nada. La señal de que quedó **demasiado bajo** sería quedarme bloqueado sin nada que hacer con una
tarjeta esperando de verdad.

GitHub no impide pasarse: pone el contador de la columna en rojo. El límite es un **acuerdo visible**,
no un candado — y esa es la diferencia entre un tablero que ordena el trabajo y uno que solo lo
dibuja.

### 3. Diagnóstico de la historia mal escrita

La historia del ejercicio (issue #13) dice: *"Como desarrollador quiero crear la tabla usuarios para
guardar los datos."*

**Por qué está mal**: es una **tarea técnica disfrazada de historia**. El beneficiario es el
desarrollador y no un usuario del sistema, el "para" no expresa ningún valor (*guardar los datos* es
un medio, no un fin: nadie usa el producto para que existan filas en una tabla), y no tiene ningún
criterio de aceptación verificable — "crear la tabla" está hecho o no está hecho, pero no hay forma
de comprobar que el sistema hace algo distinto para alguien. Además fija la **solución** (una tabla)
en vez del problema, con lo cual cierra la puerta a cualquier otra implementación.

**Cómo la reescribiría**: *"Como ciudadano quiero registrarme con mi correo y mi documento para poder
sacar turnos a mi nombre y ver los que ya pedí."* Con criterios comprobables: no se aceptan dos
cuentas con el mismo documento; un correo inválido muestra el error sin enviar el formulario; después
de registrarme veo únicamente mis propios turnos. La tabla pasa a ser lo que siempre fue — una
**tarea** dentro de esa historia, junto con el endpoint y la pantalla.

### 4. Problemas encontrados y cómo se resolvieron

- **El scope `project` de `gh` no se puede obtener sin un navegador.** Los comandos `gh project`
  piden los scopes `project`/`read:project`, que no vienen con la autenticación inicial (la mía
  traía `repo`, `workflow`, `write:packages` y otros, pero no ése). `gh auth refresh -s project`
  arranca un *device flow*: imprime un código de un solo uso y exige abrir
  `github.com/login/device` y confirmar a mano. Es un paso deliberadamente humano.
  **Todo lo que vive en el repositorio se hizo por consola** —las tres etiquetas, la épica, la
  historia, las dos tareas, el bug, la jerarquía de sub-issues y el Pull Request con `Closes`—; el
  **Project** en sí (el tablero, el campo *Sprint*, el límite de trabajo en progreso y la
  visibilidad pública) se configuró después desde la web, que es además como lo muestra el video de
  la cátedra.
- **Los backticks del shell se comieron parte del cuerpo de un issue.** Al crear la tarea #8 con
  `gh issue create --body '... `.github/workflows/ci.yml` ...'`, zsh interpretó el texto entre
  backticks como una **sustitución de comando** y el issue quedó publicado con un hueco donde iba la
  ruta (`Crear  con el disparador…`). Se detectó releyendo el issue con `gh issue view --json body` y
  se corrigió con `gh issue edit --body`. Es la misma clase de error que en un pipeline aparece como
  una variable vacía que nadie nota.
- **La jerarquía se armó con sub-issues, no con task-lists.** Las task-lists (`- [ ] #12` en el
  cuerpo) se ven parecidas pero **no** crean la relación padre-hijo navegable que el TP pide: no se
  puede subir de la tarea a su historia y de ahí a la épica. Se usó
  `gh issue edit <épica> --add-sub-issue <historia>`, disponible desde `gh` 2.94 (acá, 2.97), y se
  verificó por GraphQL que el árbol se recorre en los dos sentidos.
- **El bug va al costado de la jerarquía, no colgando de la historia.** El árbol cuenta lo que se
  planificó construir; un bug es un defecto de algo **ya entregado** — en este caso, del TP2. Si
  colgara de la historia que lo originó, esa historia (ya cerrada) volvería a mostrar trabajo
  pendiente y su barra de progreso mentiría. El matiz que sí reconozco: hay equipos que registran los
  defectos *dentro* del sprint colgados de su historia, no para planificar sino para **medir** cuántos
  se escapan; es una convención de trabajo, no una regla de la herramienta.

### 5. Declaración de uso de IA

**Todo el TP3 fue ejecutado con asistencia de IA** (Claude Code, modelo Claude Fable 5) bajo mi
indicación: la creación de las tres etiquetas, la épica, la historia con sus cuatro criterios de
aceptación, las dos tareas, el bug, el armado de la jerarquía de sub-issues, el Pull Request con
`Closes #8` y la redacción de este archivo.

Cómo se verificó:
- **La jerarquía se comprobó consultándola por GraphQL**, no mirando la pantalla: la épica #6 devuelve
  la historia #7 como sub-issue, y ésta devuelve las tareas #8 y #9.
- **La trazabilidad se comprobó sobre el resultado real**: después de mergear el PR #11, el issue #8
  quedó `CLOSED` con razón `COMPLETED`, y su *timeline* nombra al PR #11 como el que lo cerró. La
  historia #7 y la épica #6 siguen **abiertas**, que es lo que corresponde: el PR implementó una de
  las dos tareas, no la historia entera.
- El error de los backticks lo cometió la IA y quedó documentado arriba, junto con cómo se detectó.

Lo que se defiende en P1 no es haber reproducido el procedimiento: es poder explicar por qué el sprint
dura dos semanas, por qué el límite es dos, por qué cada criterio de aceptación es verificable y por
qué el bug no cuelga de la historia.

---

## TP4 — CI: Pipelines as Code

### 1. Estructura elegida del pipeline

**Dos jobs, `build-backend` y `build-frontend`, en paralelo.**

Son dos porque la app tiene **dos artefactos independientes**, cada uno con su Dockerfile del TP2:
la API en `./backend` y la SPA en `./frontend`. No es paralelismo decorativo — construir el backend
no necesita nada de lo que produce el frontend, así que serializarlos sólo agregaría espera.

Corren en **máquinas distintas**: cada job arranca en un runner limpio. Eso significa que **no
comparten nada** — ni disco, ni contenedores, ni variables, ni el resultado del `checkout`. Cada uno
vuelve a clonar el repo. Es la razón por la que cada job repite el `checkout` y el `setup-buildx`, y
la razón por la que necesitan `scope` separados en el cache (ver abajo).

**Los disparadores** son dos y hacen cosas distintas:

| Trigger | Para qué |
|---|---|
| `pull_request: branches: [main]` | El que hace el trabajo: verifica **antes** del merge, y es el que el gate exige |
| `push: branches: [main]` | Le da al badge una corrida de `main` de la cual leer el estado, y deja el cache guardado en la rama base para que los PRs siguientes lo aprovechen en su primera corrida |

Sin el de `push`, el badge no tendría estado y cada PR nuevo construiría de cero.

### 2. Qué cachea el pipeline, y qué pasa si el cache desaparece

Cachea **las capas de las imágenes Docker**, en el almacén de GitHub Actions (`type=gha`) — no en el
Docker de mi máquina ni en el del runner, que nace vacío en cada corrida. `mode=max` guarda también
las capas **intermedias** (las de la etapa de build del multi-stage), no sólo las de la imagen final:
con el default (`min`) se reutilizaría mucho menos.

Qué se reutiliza y qué no lo decide **cómo está escrito el Dockerfile del TP2**, que copia primero los
archivos de dependencias y después el código:

| Se reutiliza | Se rehace |
|---|---|
| `FROM` de las imágenes base (`sdk:8.0`, `aspnet:8.0`, `node:20-alpine`, `nginx:alpine`) | El `COPY . .` del código, en cuanto cambia cualquier archivo fuente |
| `COPY` de los `.csproj`/`.sln` y `package*.json`, mientras no cambien | El `dotnet publish` / `npm run build`, que dependen del código |
| `dotnet restore` y `npm ci` — las capas caras, las que bajan paquetes de la red | |

Cada job tiene su propio `scope` (`scope=backend` / `scope=frontend`). **No es opcional**: sin él los
dos usan el estante por defecto y **se pisan** — el último en terminar sobreescribe el cache del otro,
y lo que se ve es que un job reutiliza capas y el otro no, alternándose de corrida en corrida sin
patrón aparente. No da ningún error; sólo resultados desconcertantes.

**Si el cache desaparece, el pipeline funciona exactamente igual, sólo que más lento.** GitHub lo
desaloja cuando quiere (tiene límite de tamaño y expiración por inactividad), así que esa propiedad no
es opcional: un pipeline que **falla** sin cache no tiene un cache, tiene una **dependencia escondida**
— está usando como insumo algo que debería producir, y eso es un bug esperando a que el almacén se
vacíe. Acá el cache sólo evita rehacer trabajo: cada corrida podría construir todo de cero y llegar al
mismo resultado.

### 3. Por qué el pipeline construye con el Dockerfile en vez de compilar por su cuenta

Porque si el pipeline compilara con `dotnet build` y `npm run build` por su lado, habría **dos
definiciones de build**: la del workflow y la del Dockerfile. Tarde o temprano divergen —alguien
cambia una versión de SDK, agrega una variable, cambia un flag de publicación en una sola de las dos—
y a partir de ese momento el pipeline estaría verificando **una compilación distinta de la que después
se despliega**. El caso feo no es que falle: es que dé verde sobre algo que en producción no anda.

Construyendo con el Dockerfile hay **una sola definición**, la misma que corrió en mi máquina en el
TP2 y la misma que el TP6 va a desplegar y el TP7 va a publicar como release inmutable.

Un efecto secundario que vale la pena notar: el workflow **no tiene una sola línea de .NET ni de
Node**. No sabe qué hay adentro de la imagen. Ese mismo archivo le sirve a cualquier compañero, sea
cual sea su stack — lo que cambia es el Dockerfile.

### 4. Problemas encontrados y cómo se resolvieron

- **Las versiones de las actions del enunciado no coinciden con las publicadas.** La guía usa
  `actions/checkout@v6`, `docker/setup-buildx-action@v4` y `docker/build-push-action@v7`. Se verificó
  antes de escribir el workflow y las versiones mayores realmente publicadas son **v4**, **v3** y
  **v6**: pedir una etiqueta inexistente hace fallar la corrida antes de ejecutar nada
  (`Unable to resolve action ..., repository or version not found`), así que se usaron las reales y la
  primera corrida salió en verde. Fijar la versión mayor —y no `@main`— es deliberado: sin fijarla, el
  pipeline cambiaría solo el día que los autores de la action publiquen algo.
- **Para ver `CACHED` hacen falta dos corridas separadas, no dos pushes seguidos.** El cache se sube
  **al terminar** la corrida, así que si se pushea dos veces seguidas las corridas se solapan y la
  segunda empieza a construir cuando la primera todavía no guardó nada. Se esperó a que la primera
  terminara y recién entonces se disparó la segunda con un commit vacío
  (`git commit --allow-empty`). Además las dos tienen que ser del **mismo PR**: una corrida sólo puede
  restaurar cache de su propia rama o de la rama base, y `main` todavía no había guardado ninguno.
- **`mergeable: UNKNOWN` al consultar el estado del PR.** Igual que en el TP1: GitHub recalcula el
  estado de forma asíncrona. Se resolvió consultando en bucle hasta obtener un valor definitivo.

### 5. Declaración de uso de IA

**Todo el TP4 fue ejecutado con asistencia de IA** (Claude Code, modelo Claude Fable 5) bajo mi
indicación: la escritura del workflow, la configuración del gate por API, la demostración de la
rotura del build, el badge y la redacción de este archivo.

Cómo se verificó:
- **Las corridas se miraron de verdad**, no se asumieron: la primera construyendo de cero, la segunda
  con `CACHED` en el log, y la del PR roto fallando en el paso de build con el error del compilador.
- **El gate se comprobó sobre un PR real**: con el build en rojo, la API devuelve el PR como
  bloqueado; después del fix, los dos checks en verde y el merge habilitado. La secuencia completa
  está en el PR de la demostración.
- **La protección se leyó después de escribirla** (`gh api .../branches/main/protection`), porque el
  `PUT` **reescribe la protección entera** en vez de agregarle una línea: había que confirmar que lo
  configurado en el TP1 (cero aprobaciones y `enforce_admins`) siguiera en pie.

## TP5 — Calidad automatizada: tests, coverage y el umbral que frena un merge

**Enlaces del TP5**

| Lo que prueba | Enlace |
|---|---|
| La secuencia completa: verde → código sin tests → rojo por cobertura → tests → verde → merge | [PR #31](https://github.com/santiago6124/ingsoft3-turnos/pull/31) |
| Las dos tablas de cobertura en el Summary y los dos reportes descargables | [corrida en `main` después del merge](https://github.com/santiago6124/ingsoft3-turnos/actions/runs/39317233556) |
| La corrida **roja por umbral**, con los 27 tests en verde en el mismo log | [corrida del PR #31](https://github.com/santiago6124/ingsoft3-turnos/actions/runs/39316641178) |
| El freno vigente: **abierto y en rojo hasta la defensa** | [PR #32](https://github.com/santiago6124/ingsoft3-turnos/pull/32) · [su corrida](https://github.com/santiago6124/ingsoft3-turnos/actions/runs/39317361735) |

**Cómo lo trabajé.** Antes de tocar código escribí la spec del práctico en
[`specs/tp5-calidad/`](specs/tp5-calidad/): qué tiene que ser verdad al terminar
([`spec.md`](specs/tp5-calidad/spec.md)), cómo se cumple cada requisito
([`plan.md`](specs/tp5-calidad/plan.md)) y en qué orden, con la comprobación de cada paso
([`tasks.md`](specs/tp5-calidad/tasks.md)). El primer commit del PR #31 es esa spec. La uso así en
los TPs que siguen: un práctico por día, y cada uno arranca por su spec.

### 1. Qué lógica testeé y por qué ésa

Medí antes de escribir un solo test. El backend tenía 18 tests, y cubrían bien la grilla horaria y el
alta de turnos. Pero el reporte mostró **dos agujeros completos**: el listado con filtros del panel de
admin (`AppointmentsController.List`, 0 de 32 líneas) y los horarios disponibles que ve el ciudadano
(`AvailableSlotsController`, 0 de 26). Ahí duele un bug en esta app. Si los horarios disponibles se
equivocan, al ciudadano le aparece libre un horario que ya está confirmado, y se entera cuando el alta
lo rechaza. Si un filtro del listado se equivoca, el admin confirma el turno equivocado.

La suite quedó en **37 tests de backend sobre cinco reglas** y **36 de frontend**:

| Regla | Tests | Lo que verifican |
|---|---|---|
| Grilla horaria | `ScheduleServiceTests` | Un `[Theory]` con los siete bordes de la grilla (8:45, 9:00, 9:05, 9:15, 9:15:30, 15:45, 16:00), fin de semana, grilla completa del día |
| Horarios disponibles | `AvailableSlotsControllerTests` | Sólo un turno **confirmado** ocupa su horario (un `[Theory]` con pendiente y cancelado); otro trámite no lo ocupa; día no hábil vacío |
| Filtros del listado | `AppointmentsListTests` | Estado inválido da 400 con los valores permitidos (caso de error); el filtro de fecha toma el día entero y **nada de la medianoche siguiente**; búsqueda por nombre o DNI (`[Theory]`) |
| Alta y transiciones | `AppointmentsControllerTests` | Futuro, alineado a la grilla, conflicto por trámite, confirmar, cancelar, 404 |
| Interacción con la grilla | `AppointmentsControllerMockTests` | El mock (sección 5) |
| Front: contrato con la API | `api.test.ts` | `it.each` con el método y la URL de cada endpoint; la query de filtros; el error de la API llega con su mensaje; 204 sin cuerpo |
| Front: cuándo es el turno | `agenda.test.ts` | Un caso por cada camino de `whenIs`, con los bordes de día y de semana |

**El criterio para saber si un test vale**, comprobado y no supuesto. Invertí a mano cinco reglas,
corrí la suite y volví el código atrás:

| Cambio en el código | Qué se puso en rojo |
|---|---|
| `slotEndTime <= EndTime` → `<` en la grilla | la fila 15:45 del `[Theory]` |
| Sacar `Status == Confirmed` de los horarios disponibles | las dos filas (pendiente y cancelado) |
| `ScheduledAt < to` → `<=` en el filtro de fecha | el test de la medianoche |
| Sacar la consulta a la grilla en `Create` | el test con mock y el del horario desalineado |
| Ignorar el `error` que manda la API en `request` | el caso de error del front |

### 2. El umbral: 90 % en líneas y en ramas, de los dos lados

| | Medido en `main` | Umbral | Dónde está |
|---|---|---|---|
| Backend | **97,88 % de líneas** (185 de 189) · **100 % de ramas** (40 de 40) | 90 / 90 | `backend/Dockerfile`, etapa `test`: `/p:Threshold=90`, `/p:ThresholdType=line%2cbranch` |
| Frontend | **100 % de líneas** (128 de 128) · **100 % de ramas** (45 de 45) | 90 / 90 | `frontend/vite.config.ts`: `thresholds: { lines: 90, branches: 90 }` |

**Por qué 90 y no lo que medí.** Un umbral pegado al número real (97 o 100) rompe con cualquier cambio
legítimo, por ejemplo una línea defensiva nueva, y la reacción del equipo termina siendo bajarlo o
escribir tests para la métrica. 90 deja unos ocho puntos de margen en el backend, y el PR #32
demuestra que alcanza para frenar: una clase de 22 líneas sin tests ya lo rompe.

**Por qué también en ramas.** La línea es la métrica que más miente: una línea con un `if` cuenta
como cubierta aunque sólo se haya recorrido uno de sus caminos. Y lo vi en mi propio PR #32: **por
líneas el backend cayó a 89,8 %, a dos décimas del umbral**. Una clase apenas más chica pasaba. Por
ramas cayó a 80 %. En el frontend pasa lo contrario: vitest 2.1.9 no cuenta las ramas de una función
que nadie llama, así que ahí frena por líneas (sección 4). Con umbral en las dos métricas, frena la
que quede corta.

**Cómo lo evalúa coverlet.** Por defecto mira el mínimo por ensamblado (`ThresholdStat=minimum`). Mido
un solo ensamblado (`Turnos.Api`; el de tests no se instrumenta), así que el mínimo y el total son el
mismo número y no hizo falta cambiarlo.

**Qué pasaría si mañana lo subo diez puntos, a 100.** El backend fallaría siempre: las cuatro líneas
que faltan son el `catch (DbUpdateException)` de `Confirm` (sección 6), y ningún unit test puede llegar
ahí. Para pasar habría que excluir ese código del cálculo o escribir un test que fuerce la excepción
con un doble, y en los dos casos se termina midiendo lo que conviene medir. Para subir el umbral de
verdad primero hay que cubrir ese camino con un test de integración contra Postgres (TP7).

### 3. Qué dejé fuera de la cuenta, y por qué

**Backend.** Es la misma lista en el umbral (`/p:Exclude` del Dockerfile) y en el reporte
(`-classfilters` del `ci.yml`). Lo comprobé en el Summary: el reporte dice 185 de 189, igual que
coverlet.

| Afuera | Por qué |
|---|---|
| `Program` | El arranque: inyección de dependencias, CORS, migraciones al iniciar. Se prueba levantando la app (`/health` en 200), no con un unit test |
| `Turnos.Api.Migrations.*` | Código **generado** por EF Core. Testearlo es testear EF |
| `Turnos.Api.Data.*` | El `DbContext`: configuración, no lógica |
| `Turnos.Api.Models.*`, `Turnos.Api.Options.*` | Clases que sólo tienen propiedades |

Midiendo todo, la cobertura daba 39 %: el número quedaba hundido por el arranque y las migraciones, y
no decía nada de mi lógica. Dejé los **DTOs adentro** a propósito: `AppointmentResponseDto.FromEntity`
convierte el estado a texto, y el front depende de ese texto.

Usé `Exclude` (lo que se saca) y no `Include` (lo que se deja). Con `Exclude`, una clase nueva entra
sola a la cuenta. El PR #32 lo demuestra: `ReminderPolicy` no está nombrada en ningún lado y bajó el
número igual. Con `Include`, habría nacido invisible para el umbral.

**Frontend.** `include: ['src/*.ts']`, sin los `*.test.ts` ni los `*.d.ts`. Entran los módulos de
lógica (`api.ts`, `format.ts`, `services.ts`, `agenda.ts`). Quedan afuera los componentes `.tsx`: son
UI y su test (`AdminView.test.tsx`) necesita DOM. Si los midiera, el número diría cuánto renderizo y no
cuánta lógica verifico. `types.ts` aparece en el reporte con 0 de 0: son sólo interfaces de TypeScript
y no generan código. Como el `include` es un patrón y no una lista, un `.ts` nuevo entra sin tocar
nada (es lo que le pasó a `agenda.ts` en el PR #31).

### 4. El Pull Request bloqueado

En el **PR #31**, después de la primera corrida en verde, subí `src/agenda.ts`: `whenIs`, la función
que le dice al ciudadano en la confirmación cuándo es su turno («Hoy», «Mañana», «En 3 días»), sin
tests.

- **Qué se puso en rojo**: `build-frontend`, que es required check de `main` desde el TP4. El
  `build-backend` siguió verde porque el código nuevo no estaba ahí.
- **En qué métrica**: líneas. El log de la [corrida roja](https://github.com/santiago6124/ingsoft3-turnos/actions/runs/39316641178)
  dice `Tests 27 passed (27)` y abajo `ERROR: Coverage for lines (80.46%) does not meet global
  threshold (90%)`. Las ramas apenas bajaron (96,87 %): en **vitest 2.1.9** una función que ningún
  test llama no suma ramas, sólo líneas sin cubrir.
- **Por qué no se podía mergear si compilaba y pasaba todo**: el job no mide sólo si anda, también
  mide cuánto de lo que se agregó está verificado. 37 líneas nuevas sin un test bajan la proporción
  debajo del número que elegí, y el job sale con error aunque no haya ninguno en el código.
- **Qué escribí para arreglarlo**: un caso por cada camino que declara `whenIs`, más los bordes entre
  ellos. Son nueve tests: fecha ilegible, ya pasó, hoy, mañana (a las 20 h del día anterior, que son
  menos de 24 horas), 2 días, **6 días** (el último que se cuenta en días), **7 días** (ya es «una
  semana»), 13 días y 3 semanas. `now` entra por parámetro para que el resultado no dependa del reloj.
  Volvió al 100 %, la [corrida](https://github.com/santiago6124/ingsoft3-turnos/actions/runs/39316940723)
  quedó verde y lo mergeé.

**El freno vigente es el PR #32**, del lado del backend: `ReminderPolicy`, una regla con cinco
decisiones y sin tests. Los 37 tests pasan y `build-backend` falla con *The minimum line coverage is
below the specified 90* y *The minimum branch coverage is below the specified 90*. Queda abierto y en
rojo hasta la defensa.

**Por qué este freno es distinto del del TP4.** El del TP4 frena lo que **no anda** (no compila, no
construye la imagen). Éste frena lo que **anda pero nadie verificó**. Es la primera vez que me frena un
criterio que elegí yo y no la máquina diciendo «esto está roto». **Qué deja pasar igual**: un test
que ejecuta el código sin verificar lo que importa (sección 5), lógica que está mal y tiene un test
que confirma el error, y todo lo que no se mide por líneas (UI, rendimiento, seguridad).

### 5. Por qué coverage alto no es calidad, con mi ejemplo

`AppointmentResponseDto.FromEntity` está cubierto al 100 %: lo ejecutan casi todos los tests de
controller. Hice la prueba de cambiar `CreatedAt = a.CreatedAt` por `CreatedAt = a.ScheduledAt`, un bug
real: el front mostraría como fecha de alta la fecha del turno. **Los 37 tests pasaron y la cobertura
no se movió: 97,88 % y 100 %**. La línea se ejecuta, pero ningún assert mira qué escribe. La cobertura
dice qué código **corrió**, no qué código **se verificó**. Un test sin asserts sumaría la misma
cobertura.

### 6. El ejercicio del camino sin cubrir

Con la suite nueva, el reporte marcaba una sola rama naranja en el backend:

1. **Qué línea es**: `AppointmentsController.cs`, línea 119, `if (appointment is null)` dentro de
   `Confirm`. Se ejecutaba siempre por el lado de «lo encontró». El camino del `return NotFound(...)`
   no lo recorría ningún test (lo mismo en `Cancel`, línea 160).
2. **Qué entrada la recorre**: un id que no existe. Concretamente, `Confirm(999)` sobre una base vacía.
3. **Qué decidí**: **agregar los tests** (`Confirm_UnknownId_ReturnsNotFound` y
   `Cancel_UnknownId_ReturnsNotFound`). El 404 es parte del contrato de la API, y si se rompiera, el
   front mostraría «Error 500» en vez de «No existe el turno». Con eso las ramas quedaron en 40 de 40.

**Lo que sigue sin cubrir, y lo dejo así a propósito**: las líneas 146 a 149, el
`catch (DbUpdateException)` de `Confirm`. Se recorre cuando dos admins confirman a la vez dos turnos
del mismo horario, el chequeo previo pasa para los dos y el índice único parcial de Postgres rechaza el
segundo. Con el proveedor InMemory de los tests no se puede recorrer, porque **no aplica índices**.
Forzarlo con un doble que tire la excepción probaría que sé escribir un `catch`, no que el índice
existe. Es un test de integración contra Postgres real, y va en el TP7.

### 7. El mock, y el refactor que lo hizo posible

**Backend: no hizo falta refactorizar.** `AppointmentsController` ya recibía `IScheduleService` por
constructor desde el TP2. El test `Create_GridRejectsTheSlot_ReturnsBadRequestAndSavesNothing` le
pasa un doble de Moq:

- **Arrange**: `Setup(g => g.IsSlotValid(It.IsAny<DateTime>())).Returns(false)`. Hasta acá es un
  **stub**: una respuesta preparada.
- **Assert**: además del 400 y su mensaje, `Verify(g => g.IsSlotValid(scheduledAt), Times.Once)` (el
  controller le preguntó a la grilla, una vez, por la fecha exacta que recibió) y que la base siga
  vacía. Verificar la **interacción** es lo que lo hace un **mock** y no un stub.

Los otros tests del controller usan el `ScheduleService` **real**, así que prueban controller y grilla
juntos. Éste aísla el controller.

**Lo que sí encontré y no refactoricé**: `Create` lee `DateTime.Now` adentro. Por eso los tests de
alta necesitan el truco `NextThursdayAt` (calcular «el próximo jueves» para que la fecha siempre sea
futura y hábil). La salida correcta es inyectar un `TimeProvider`. No entra en este TP porque tocaría
todos los tests de alta. Lo dejo anotado como deuda.

**Frontend: sí hubo refactor.** `request()` de `src/api.ts` usaba el `fetch` global, y no había por
dónde meterle un doble sin salir a la red. Ahora recibe el cliente como parámetro opcional
(`fetcher: Fetcher = fetch`), igual que las funciones de cada endpoint. Los componentes no cambiaron:
no lo pasan y siguen usando el `fetch` del navegador. Los tests le pasan un `vi.fn()` que contesta lo
que cada caso necesita, y verifican la URL y el método que recibió. De paso separé
`buildAppointmentsQuery(filters)`, que arma la query de los filtros: era lógica pura pegada a la red,
y ahora se prueba con `it.each` sin doble.

Comprobé que el refactor no rompió nada en la app real: `docker compose up --build`, `/health` en 200
y `GET /api/available-slots` a través de nginx en 200.

### 8. Problemas encontrados y cómo los resolví

- **El umbral del front me frenó antes del PR de demostración.** En la primera medición local dio
  86,4 % de líneas contra 90, con todos los tests en verde. Lo que faltaba eran las funciones de cada
  endpoint (`confirmAppointment`, `cancelAppointment`...), envoltorios de una línea. Pensé en
  excluirlas, pero son justamente el contrato con el backend: un `/confirm` en vez de `/confirmar`
  compila, pasa todo lo demás y rompe la app. Les agregué el `fetcher` y un `it.each` con el método y
  la URL de cada una.
- **La carpeta de resultados salía vacía en local.** El `docker run` con
  `-v /private/tmp/...:/out` corría los tests en verde, pero no aparecía ningún archivo afuera. Es el
  mismo problema de colima del TP2: sólo comparte `$HOME` con la máquina virtual, y un volumen fuera
  de ahí se monta como una carpeta vacía **sin dar error**. Lo resolví montando una carpeta dentro del
  repo (ignorada por `.gitignore`). En el runner de GitHub no pasa.
- **Por líneas, el PR #32 casi no frena.** La primera versión de `ReminderPolicy` dejaba el backend en
  89,8 %, dos décimas debajo del umbral. Frena con firmeza por ramas (80 %). Lo dejo así porque es la
  mejor prueba de por qué el umbral mira las dos métricas.
- **Las versiones de las actions.** La guía usa `docker/build-push-action@v7` y
  `actions/upload-artifact@v6`. Mantuve `build-push-action@v6`, la que ya usaba el workflow desde el
  TP4, para no mezclar en el mismo PR una actualización de versiones con el cambio de este práctico.
  `upload-artifact@v6` existe y la usé como está en la guía.
- **Se coló un reporte en el repositorio.** `coverlet.msbuild` deja un `coverage.json` dentro del
  proyecto de tests cada vez que corro el umbral en local, y entró en un commit del PR #31 con un
  `git add` de la carpeta entera. Lo saqué del índice y lo agregué al `.gitignore` y al
  `.dockerignore` del backend. En el `.dockerignore` también importa: un archivo que cambia en cada
  corrida dentro del contexto invalida el cache del `COPY . .` en cada build.
- **Que los tests de fechas no dependan de la zona horaria.** El contenedor del CI corre en UTC y mi
  máquina en hora de Argentina. `agenda.test.ts` arma las fechas en hora local de los dos lados y
  cuenta días de calendario. Lo corrí también con `TZ=UTC` antes de pushear, y dio igual.

### 9. Declaración de uso de IA

**El TP5 lo hice con asistencia de IA** (Claude Code, modelo Claude Opus 5.5), con la IA operando
`dotnet`, `npm`, `docker`, `git` y `gh` bajo mi indicación. La IA redactó la spec a partir del
enunciado y de la medición inicial, escribió los tests, el refactor de `api.ts`, las etapas de los
Dockerfiles, los pasos del workflow y el borrador de este archivo. Yo decidí qué reglas importaban en
mi app, el umbral y las exclusiones, y revisé cada test contra la pregunta que pide el enunciado: qué
verifica cada assert y qué caso no cubre.

Cómo lo verifiqué:
- **Cada test se comprobó rompiendo el código, no leyéndolo**: las cinco mutaciones de la sección 1,
  cada una con su test en rojo, y el código restaurado después (`git diff` vacío).
- **El umbral se comprobó en los dos sentidos antes de subirlo**: con `Threshold=99` el backend sale
  con error y los 37 tests en verde; con 90 pasa. En el front, el mismo rojo apareció solo (sección 8).
- **El reporte y el umbral miden lo mismo**: ReportGenerator dice 185 de 189 líneas y coverlet dice
  97,88 %, que es 185/189.
- **Las corridas se miraron en el log**, no en el color del check: la roja del PR #31 dice
  `27 passed` y el `ERROR: Coverage for lines`; la del PR #32, `Passed: 37` y los dos errores de
  coverlet.
- **La app se levantó después del refactor** (sección 7), porque los tests pasan igual aunque la
  inyección real esté rota.
- **El ejemplo de la sección 5 se ejecutó**, no se razonó: el cambio de `CreatedAt` con la suite y la
  cobertura medidas.

## TP6 — Entrega continua: entornos, aprobaciones y deployment patterns

### Enlaces de este TP

| Qué | Enlace |
|---|---|
| Paquete del backend (público, etiquetas `sha-<commit>`) | https://github.com/santiago6124/ingsoft3-turnos/pkgs/container/ingsoft3-turnos-backend |
| Paquete del frontend | https://github.com/santiago6124/ingsoft3-turnos/pkgs/container/ingsoft3-turnos-frontend |
| `docker pull` sin credenciales (commit del merge de #34) | `docker pull --platform linux/amd64 ghcr.io/santiago6124/ingsoft3-turnos-backend:sha-94b8c84d35b56d4ba7871b05d1fe9e22b3461688` (ídem `-frontend`) |
| Cadena, eslabón 2: job de un PR con los tests en verde y **«Entrar al registry» salteado** | [corrida del PR #34, job `build-backend`](https://github.com/santiago6124/ingsoft3-turnos/actions/runs/39447828299/job/118714336743) |
| Cadena, eslabón 3: corrida de `main` donde **publicar es el último paso** | [corrida de `main` tras #34, job `build-backend`](https://github.com/santiago6124/ingsoft3-turnos/actions/runs/39448080594/job/118715217493) |
| **QA** | front https://turnos-front-qa-eo7o.onrender.com · api https://turnos-api-qa-ga8a.onrender.com |
| **PROD** | front https://turnos-front-prod-49p5.onrender.com · api https://turnos-api-prod-rowo.onrender.com |
| La corrida **rechazada**, con su motivo | https://github.com/santiago6124/ingsoft3-turnos/actions/runs/39601462355 |
| La corrida **aprobada** con el cambio visible en PROD | https://github.com/santiago6124/ingsoft3-turnos/actions/runs/39606647929 |
| Release `v6.0.0` | https://github.com/santiago6124/ingsoft3-turnos/releases/tag/v6.0.0 |

Las URLs de Render llevan un sufijo (`-eo7o`, `-ga8a`…) porque los nombres limpios ya estaban tomados
en `onrender.com`. Son del plan free: la primera visita después de un rato tarda hasta un minuto en
despertar.

**Cómo lo trabajé.** Igual que el TP5, arranqué por la spec
([`specs/tp6-cd/`](specs/tp6-cd/)), que es el primer commit del PR #34. Los desvíos respecto del plan
están anotados al final de [`tasks.md`](specs/tp6-cd/tasks.md).

### 1. El artefacto: por qué se publica sólo en verde

Cada merge a `main` publica dos imágenes en `ghcr.io`, etiquetadas con el commit que las produjo. Que
lo publicado sea lo verificado no depende de un control, sino de **tres eslabones encadenados**:

1. **Nada entra a `main` sin verde**: `build-backend` y `build-frontend` son required checks desde el
   TP4, y desde el TP5 corren los tests con el umbral de cobertura.
2. **Sólo `main` publica**: el paso tiene `push: ${{ github.event_name == 'push' && github.ref ==
   'refs/heads/main' }}`. Las dos condiciones van en el paso y no sólo en el disparador: si mañana le
   agrego otra rama al `on:`, un push a esa rama no publicaría nada que no haya pasado por un PR.
3. **Publicar es el último paso del mismo job que corre los tests.** No hay ningún `if` que diga «si
   los tests pasaron»: si el `docker run` de los tests sale en rojo, el job muere ahí y nunca llega a
   publicar. La condición está **en el orden**. Por eso moví el build de la imagen final, que en el
   TP4 estaba antes de los tests, al final del job.

**Si se publicara igual cuando los tests fallan**, estar en el registry dejaría de querer decir «esto
pasó la verificación». Sería un depósito de builds, y nadie podría desplegar desde ahí con confianza.

**Lo que esta cadena NO garantiza**:
- **Un push hecho a mano entra igual.** Con un token con `write:packages` (el mío, por ejemplo) se
  puede subir cualquier cosa con la etiqueta `sha-…` que se me ocurra. La cadena evita el error por
  accidente, no el abuso.
- **La etiqueta se puede mover.** Un tag de imagen es un nombre que se puede volver a apuntar a otra
  imagen. Lo que identifica una imagen sin ambigüedad es su **digest** (`sha256:…`), el hash de su
  contenido. Desplegar por digest es lo que garantiza que corre exactamente lo que se verificó.

**El permiso va por job** (`permissions: contents: read, packages: write` dentro de cada `build-*`) y
no a nivel del workflow. Arriba de todo reemplazaría el default de **todos** los jobs, incluidos los de
deploy, que no publican nada. Es mínimo privilegio. La credencial es el `GITHUB_TOKEN` de la corrida,
que vive lo que dura el job: no hay ningún secret que guardar.

**Nombre de los paquetes.** En el TP2 había subido a mano `turnos-backend` y `turnos-frontend` con
etiquetas `v0.1.x`. No los reutilicé: no están vinculados al repo, así que el `GITHUB_TOKEN` no puede
escribir en ellos, y además tienen imágenes que nunca pasaron por ningún pipeline. Los nuevos llevan el
nombre del repo y nacieron vinculados a él y **públicos**: un paquete publicado desde un repo público
hereda su visibilidad, y no hubo que tocar nada en la web. Los del TP2 siguen ahí porque los usa
`docker-compose.registry.yml`.

### 2. Continuous Delivery, no Continuous Deployment

- **CI**: cada cambio se integra y se verifica automáticamente (TP4 y TP5).
- **Continuous Delivery**: cada cambio verificado queda **listo** para producción y llega solo hasta
  un entorno igual a producción (QA). El paso a producción es una decisión humana.
- **Continuous Deployment**: lo mismo, pero sin la decisión humana. Todo lo que pasa la verificación
  llega a producción solo.

**Implementé Continuous Delivery**: QA se despliega solo y PROD espera la aprobación. Corresponde a mi
contexto porque **mi verificación todavía no alcanza para confiarle producción a la máquina**: los
tests son unitarios, el smoke sólo prueba que la app contesta (sección 6) y no tengo ninguna métrica
de errores en producción (llega en el TP9). Para pasar a Continuous Deployment me faltaría, como
mínimo, tests de integración y end-to-end contra QA (TP7), monitoreo con alertas (TP9) y un rollback
automático cuando el smoke de PROD falla. ¿La querría? Para una app de turnos de un organismo público,
no sin todo eso: un deploy roto un lunes a las 9 deja a la gente sin poder sacar turno.

### 3. La cadena de jobs y dónde vive cada secret

```
build-backend ─┐
               ├─▶ deploy-qa ──────────────▶ deploy-prod
build-frontend ┘    needs: los dos builds       needs: deploy-qa
                    if: sólo main               environment: production  ⏸ aprobación
                    environment: qa             concurrency: deploy-prod
```

- **`needs`** hace la cadena: sin los dos builds en verde no hay deploy a QA, y sin QA vivo con el
  commit nuevo no hay deploy a PROD.
- **`if: github.ref == 'refs/heads/main'`** sólo está en `deploy-qa`. `deploy-prod` no lo repite y no
  hace falta: depende de `deploy-qa`, y si éste se saltea (en un PR), el que depende de él también.
- **`environment`** conecta el job con el environment de GitHub. Me da tres cosas, y se ven en
  *Settings → Environments* y en *Deployments*: **secrets propios**, **reglas de protección** (el
  reviewer de `production`) y un **historial de qué commit está en cada entorno**.

| Secret | Dónde vive | Quién lo puede leer |
|---|---|---|
| `RENDER_HOOK_API_QA`, `RENDER_HOOK_FRONT_QA` | environment `qa` | sólo un job con `environment: qa` |
| `RENDER_HOOK_API_PROD`, `RENDER_HOOK_FRONT_PROD` | environment `production` | sólo un job de `production` **ya aprobado** |
| `GITHUB_TOKEN` (para ghcr) | no se guarda: lo genera cada corrida | el job, mientras dura |

Un deploy hook es una URL que, con sólo pedirla, despliega ese servicio: **quien la tiene, despliega**.
Si los de PROD estuvieran en los secrets del repo, cualquier job de cualquier workflow los podría
leer, incluido uno que alguien agregue en un PR, y la aprobación pasaría a ser decorativa. Dentro del
environment, sin aprobación nadie los lee.

**Los hooks se llaman con `&ref=$GITHUB_SHA`**. Un hook pelado despliega **la punta de `main`**, no el
commit verificado. Con dos merges seguidos, la corrida del primero desplegaría el segundo, que todavía
no pasó por nada. En PROD importa todavía más: entre que una corrida queda esperando y que la apruebo
pueden pasar horas, y sin el `&ref` aprobaría A y a producción subiría lo último que haya. Va `&` y no
`?` porque la URL del hook ya trae su `?key=…`.

**Lo comprobé en el primer deploy**, en vez de creerlo: el commit de #35 llegó sólo a los dos servicios
de QA, disparado por `deploy_hook`, mientras PROD seguía en el anterior. Y el primer deploy a PROD
llegó sólo a los dos de PROD. Así sé que cada hook apunta a su servicio.

**Lo que pasa entre dos merges seguidos, medido el 21/10.** Mergeé #39 y después #40. La corrida del
push de #39 **apareció en Actions veinte minutos tarde**, y la de #40 **no apareció nunca**, con
GitHub informando todo operativo. Si las dos hubieran llegado al gate, la regla sería rechazar a mano
la más vieja: aprobarla después de la nueva haría retroceder PROD. El `concurrency` evita dos deploys a
PROD a la vez, pero no ordena la cola de aprobaciones.

### 4. Los entornos, y qué quedó por variable y qué adentro de la imagen

| | QA | PROD |
|---|---|---|
| Base (Neon, proyecto «Ingedesoft», `aws-us-east-1`) | `app_qa` | `app_prod` |
| API (Render, Docker, Virginia) | `turnos-api-qa` | `turnos-api-prod` |
| Front (Render, Docker, Virginia) | `turnos-front-qa` | `turnos-front-prod` |

Elegí Render en **Virginia** porque es la misma región de AWS que Neon: cada consulta de la API a la
base no cruza el continente. Los servicios los creé **por la API de Render**, una vez, con
**Auto-Deploy en `no`** en los cuatro. Si estuviera prendido, Render se desplegaría solo en cada push,
sin esperar el CI ni la aprobación, y mi pipeline sería decorado. Las tablas las crea la app al
arrancar (`Database.Migrate()` desde el TP2), así que no hubo que correr nada a mano en Neon.

**Por variable de entorno** (cambia por entorno, la imagen no):
- API: `ConnectionStrings__AppointmentsDb` (la de **su** base) y `PORT=8080`.
- Front: `BACKEND_URL` (la API de **su** entorno), `DNS_RESOLVER=8.8.8.8` y `PORT=80`.

**Adentro de la imagen** (igual en todos los entornos): el código, el bundle, la plantilla de nginx y
los valores por defecto para compose (`BACKEND_URL=http://backend:8080`, `DNS_RESOLVER=127.0.0.11`).

**La dirección del backend ya no está en la imagen del front.** `nginx.conf` pasó a
`default.conf.template`, y nginx reemplaza `${BACKEND_URL}` y `${DNS_RESOLVER}` al arrancar. Lo probé
en local con la misma imagen, sin variables (queda `http://backend:8080`, como en compose) y con las de
QA (queda la URL de Render). Esto es lo que hace posible el TP7: la **misma** imagen puede correr en
QA y en PROD, y cada una habla con su API.

**Cómo comprobé que cada entorno usa su propia base.** Inserté un turno a nombre de `SOY PROD` **sólo
en `app_prod`**. La API de PROD lo devuelve (`/api/turnos?search=SOY PROD` → 1) y la de QA no (→ 0).
Las dos cadenas de conexión difieren en una palabra (`app_qa` contra `app_prod`), y si las hubiera
cruzado no se habría puesto nada en rojo.

### 5. Qué mira mi aprobador antes de aprobar

El aprobador soy yo, así que estos son mis criterios, y son los que escribí en las dos decisiones:
- **Que QA corra el commit que se pide aprobar, en la API y en el front.** El smoke ya lo exige, pero
  miro el log del smoke y no sólo el color: cuántas vueltas tardó y qué devolvió.
- **Que el cambio se vea en QA**: abro la URL de QA y busco lo que cambió.
- **Qué toca el cambio**: si toca la cadena de conexión, las migraciones o el workflow, lo miro con
  más tiempo.
- **Que no haya otra corrida esperando**: si hay dos, rechazo la vieja.

**Lo que mi aprobador no puede ver**: cómo se comporta el cambio con tráfico real, si hay errores que
el smoke no ejercita (el smoke no crea ni confirma turnos), y qué pasa con los datos de producción, que
QA no tiene. Para decidir mejor me falta observabilidad: errores y latencia por versión (Sentry, TP9) y
tests end-to-end contra QA (TP7).

**Las dos decisiones que tomé**:
- **Rechazo** ([corrida](https://github.com/santiago6124/ingsoft3-turnos/actions/runs/39601462355)):
  el front de QA seguía sirviendo la versión anterior aunque Render lo había marcado `live` con el
  commit nuevo, y el smoke no lo había visto (sección 7). No lo pasé a producción hasta que el smoke
  verificara también la versión del front.
- **Aprobación** ([corrida](https://github.com/santiago6124/ingsoft3-turnos/actions/runs/39606647929)):
  con el smoke nuevo, la API y el front de QA corrían ese commit y el pie de página con el horario de
  atención se veía en QA. Después de aprobar, el pie se ve en PROD.

### 6. Qué prueba el smoke test, y qué no

Reintenta **30 vueltas cada 20 segundos**, con `--max-time 10` en cada `curl`, y da verde sólo
cuando se cumplen las cuatro condiciones:

1. `/health` de la API contesta **con el commit verificado**. `/health` ya comprobaba la base desde el
   TP2, y ahora devuelve `RENDER_GIT_COMMIT`, que Render define con el commit que desplegó.
2. `/api/turnos` contesta: la API llega a **su** base y las tablas existen.
3. `/version.txt` del front es **el commit verificado** (sección 7).
4. `/api/turnos` **a través del front** contesta: nginx llega a la API de su entorno.

**Por qué reintenta**: es el contrato del free tier. Render tarda entre 30 segundos y un minuto en
construir cada servicio, y un servicio dormido tarda hasta un minuto en despertar. Un `curl` seco daría
rojo en casi todos los deploys sin que nada estuviera roto. El `--max-time` es lo que evita que un
servicio despertando, que acepta la conexión y no contesta, cuelgue el job hasta el límite del runner.

**Por qué compara el commit, y no sólo el 200**: el hook responde al instante y Render construye en
segundo plano, **sirviendo la versión anterior mientras tanto**. En el primer deploy a QA el log lo
muestra: en las vueltas 2 a 4, `/health` contestaba 200 con `{"status":"ok","database":"ok"}`, la
versión vieja, que todavía no tenía el campo `commit`. Un smoke que sólo mirara el 200 habría dado
verde ahí. El verde llegó en la vuelta 5.

**Lo que NO prueba**: que la app **funcione**. No crea un turno ni lo confirma; un bug en la lógica
pasa el smoke tranquilo. Tampoco prueba rendimiento ni que la versión siga sana cinco minutos después.
Prueba que lo desplegado es lo que se verificó y que está vivo y conectado. Lo funcional contra un
entorno real es el TP7.

### 7. Qué garantía pierdo porque Render reconstruye, y cuándo me pasó

Render **no ejecuta la imagen que publiqué**: con el hook, vuelve a construir el commit desde el repo.
Despliego el **commit** verificado, pero no la **imagen** verificada. Son dos construcciones del mismo
código, y nada garantiza que salgan iguales: una imagen base que se actualizó entre una y otra, una
dependencia resuelta distinto, o el cache del constructor.

**Me pasó, con el cache.** En el deploy a QA del PR #37, Render marcó el front como `live` con el
commit nuevo. Su log de build mostraba el bundle nuevo (`index-D8Ua-6Da.js`), pero el front siguió
sirviendo el anterior (`index-Bk72TBgo.js`), con archivos fechados en el primer deploy. Descarté que
fuera mío: construí en local la imagen de ese mismo commit y traía el bundle nuevo. Redesplegué **sólo
el front de QA**, a mano por la API de Render y fuera del pipeline, con su cache de build borrado, y
ahí apareció el cambio. El smoke había dado verde porque sólo comparaba el commit de la API: del front
sólo comprobaba que contestara.

Por eso rechacé esa corrida y entró el PR #38: el Dockerfile del front graba en `/version.txt` el
commit con el que se construyó (`GIT_COMMIT` desde el pipeline, `RENDER_GIT_COMMIT` desde Render, que
lo pasa como build arg) y el smoke lo exige. Ahora un front viejo queda en rojo. No resuelve el
problema de fondo, que es que **en el TP6 lo que corre no es lo que se testeó**: lo resuelve el TP7,
donde Render ejecuta la imagen publicada.

### 8. La letra chica del free tier, y cómo la maneja el pipeline

- **Render duerme cada servicio a los 15 minutos sin tráfico**, y el primer pedido lo despierta en
  hasta un minuto. El smoke lo absorbe con los reintentos, y para la defensa los despierto un rato
  antes.
- **750 horas de instancia por mes, por workspace, no por servicio.** Con los cuatro durmiendo cuando
  nadie los usa, no se acercan. Lo que las agotaría es dejar algo haciendo ping para que no duerman, y
  por eso no lo hice: si se acaban, Render suspende los servicios hasta fin de mes y mis URLs tienen
  que vivir hasta el 30/10.
- **500 minutos de build por mes.** Cada promoción completa son hasta cuatro builds (API y front, QA y
  PROD), y medí entre 30 y 70 segundos cada uno: unos 4 minutos por promoción. Si se acabaran, el hook
  respondería igual, Render no construiría y el smoke viejo habría dado verde contra la versión
  anterior. Con la comparación de commits de la sección 6, ahora daría rojo.
- **Neon** suspende el cómputo a los 5 minutos sin uso y despierta en menos de un segundo. Su free
  tier no expira, a diferencia del Postgres gratis de Render, que vence a los 30 días: por eso la base
  está en Neon.

### 9. Deployment pattern para una producción real, y el rollback

**Para esta app con usuarios reales elegiría blue-green.** Dos entornos de producción idénticos: el
nuevo se despliega y se verifica al lado del que atiende, y el tráfico se pasa de uno a otro de una
vez. El rollback es volver a mover el tráfico, que es casi instantáneo, porque la versión anterior
sigue levantada.
- **Por qué ése y no canary**: canary manda un porcentaje del tráfico a la versión nueva y compara
  errores y latencia. Para eso hacen falta un balanceador que reparta por porcentaje (el free tier de
  Render no lo tiene) y **métricas por versión** para decidir, que hoy no tengo. Además, con el volumen
  de una oficina de turnos, un 5 % del tráfico son tan pocos pedidos que no dirían nada.
- **El costo**: duplicar producción mientras dura el cambio. Para esta app, que es chica, es barato.
- **La trampa**: las dos versiones comparten la base. Una migración que no sea compatible hacia atrás
  rompe la versión vieja en cuanto se aplica. Blue-green obliga a migraciones en dos pasos (primero
  agregar, después de que nada use lo viejo, sacar).
- **Feature flags** los usaría para lo que cambia lo que ve el ciudadano. Por ejemplo, el aviso de
  «Cuándo» del TP5: se despliega apagado y se prende cuando se decide. *Deploy ≠ release*: el código
  está en producción, pero la funcionalidad sale cuando se prende el flag.

**Mi rollback actual, paso a paso, medido el 21/10**:
1. En *Deployments* → `production`, o en la release anterior, busco el último commit bueno: la
   `v6.0.0`, `964a9b2`.
2. Disparo el deploy de ese commit en los dos servicios de PROD. Lo hice con la API de Render
   (`POST /v1/services/<id>/deploys` con `commitId`), que es lo mismo que llamar al hook con
   `&ref=<sha>`: los hooks están como secrets en GitHub y no se pueden volver a leer.
3. Espero a que los dos figuren como **live** en *Deploys* y verifico `/health` y `/version.txt`.

**Cuánto tardó** (horas de *Deploys* de Render, 21/10, de `6bb4088` a `964a9b2`):

| Servicio | Inicio | Live | |
|---|---|---|---|
| API de PROD | 23:09:09 | 23:09:38 | 28 s |
| Front de PROD | 23:09:10 | 23:09:42 | 32 s |

**34 segundos** desde el disparo hasta los dos en `live`. Es rápido porque Render reutilizó su cache
de build. Sin cache, un build medido de cero tarda alrededor de un minuto por servicio. A eso hay que
sumarle lo que tardo en darme cuenta y decidir, que hoy no está medido: sin monitoreo (TP9), me entero
cuando alguien avisa. Es la métrica DORA de **tiempo de recuperación** (*time to restore*).

**Lo que el rollback no deshace**:
- **Los datos.** El turno `SOY PROD` sigue en `app_prod`. Si la versión mala hubiera aplicado una
  migración que borra una columna, volver al código anterior no la trae de vuelta: haría falta un
  backup de la base (Neon permite restaurar a un punto en el tiempo) y migraciones reversibles.
- **El registro de GitHub.** Como el rollback fue por fuera del pipeline, *Deployments* sigue diciendo
  que en `production` está `6bb4088`, cuando corre `964a9b2`. El historial dejó de decir la verdad.
  Para que no pase, el rollback tendría que ir por el pipeline: re-correr el job `deploy-prod` de la
  corrida de `v6.0.0` (pide aprobación de nuevo, y GitHub sólo lo permite hasta 30 días) o un
  workflow manual que reciba el commit.

### 10. Si Render desaparece mañana

Sobrevive casi todo sin cambios: los Dockerfiles, las imágenes en ghcr, los tests, el umbral, la
cadena de jobs, los environments con sus reglas y la plantilla de nginx que lee la configuración del
entorno. Migran **dos cosas**: cómo se dispara el deploy (los hooks de Render pasan a ser otro comando
del proveedor nuevo) y las URLs del smoke. Sobrevive porque el contrato con el proveedor es chico: «corré
este contenedor con estas variables». Y la base, en Neon, ni se entera.

### 11. Problemas encontrados y cómo los resolví

- **El front de QA quedó viejo aunque Render lo marcó `live`.** Contado en la sección 7: cache de build
  de Render, detectado comparando el bundle que servía con el de su propio log, y resuelto en el
  pipeline con `/version.txt` en el smoke.
- **Aprobé por error la primera corrida que llegó al gate.** En la corrida de #36, mi comentario era
  un motivo para **no** desplegar («el merge sólo cambia el workflow… uso un cambio visual para
  verificar»), pero apreté *Approve*. GitHub no deja editar una decisión, así que quedó registrado como
  aprobado. No la cancelé a mitad de camino: los hooks probablemente ya se habían disparado y podía
  dejar la API y el front de PROD en commits distintos. Sirvió para comprobar que los hooks de PROD
  apuntaban a PROD. El rechazo lo hice en la corrida siguiente.
- **GitHub demoró y perdió eventos de push.** La corrida del merge de #39 apareció veinte minutos
  tarde, y la de #40 no apareció nunca, con la página de estado de GitHub en verde. Mi workflow no
  tiene disparo manual y `main` está protegida, así que no tenía forma de relanzarla sin otro merge.
  Lección para el TP7: agregar `workflow_dispatch`.
- **zsh y las etiquetas de imagen.** Al verificar los paquetes, `docker pull …-$s:sha-$SHA` falló con
  `bad substitution`: zsh lee `$s:s` como un modificador de variable. Se arregla con llaves:
  `${s}:sha-${SHA}`.
- **La imagen publicada dice que se creó un día antes de publicarse.** `docker image inspect` daba
  como `Created` el 19/10, el día del TP5. El build salió entero del cache de GitHub Actions, con las
  mismas entradas, y la imagen es idéntica a la de entonces. La etiqueta `sha-` dice de qué commit es;
  la fecha dice cuándo se armaron las capas por primera vez.
- **Los deploy hooks no salen por la API de Render.** Creé los servicios por API, pero los hooks los
  tuve que copiar del panel y cargarlos con `gh secret set --env`, sin `--body`, para que no queden en
  el historial de la terminal.

### 12. Declaración de uso de IA

**El TP6 lo hice con asistencia de IA** (Claude Code, modelo Claude Opus 5.5), con la IA operando
`git`, `gh`, `docker`, `psql` y las APIs de Neon y Render bajo mi indicación. La IA escribió la spec,
los cambios al workflow, la plantilla de nginx, el commit en `/health` y en `/version.txt`, creó las
bases y los servicios por API, hizo el rollback y redactó el borrador de este archivo.

**Lo que hice yo**: crear las cuentas de Neon, Render, Sentry y UptimeRobot y sus claves (guardadas
en un archivo fuera del repo, que la IA sólo carga sin mostrar); conectar Render sólo a este repo;
copiar los cuatro deploy hooks del panel a los secrets de cada environment; y **las decisiones del
gate**: el rechazo y las aprobaciones, con sus motivos, son míos. Para eso miré QA antes de cada una.

Cómo lo verifiqué:
- **Cada hook, contra su servicio**: después de cada deploy se consultó en Render qué servicio recibió
  qué commit y con qué disparador (`deploy_hook`).
- **Cada smoke, en su log**, no en el color: las vueltas con la versión vieja y la vuelta en que llegó
  el commit nuevo.
- **El problema del front viejo se investigó hasta el final** antes de decidir: el bundle servido
  contra el log de build de Render, la imagen construida en local, el redeploy con cache borrado.
- **Las bases separadas**, con el dato `SOY PROD` consultado en las dos APIs.
- **El rollback**, con las horas de *Deploys* de Render y con `/version.txt` y `/health` diciendo el
  commit de `v6.0.0` después.

## TP7 — Contenedores en el pipeline: la imagen como release, integración y e2e

Los enlaces están arriba de todo, en «Enlaces del TP7». La spec está en
[`specs/tp7-imagen-e2e/`](specs/tp7-imagen-e2e/).

### 1. Build once, deploy many: qué problema del TP6 resuelve

En el TP6, Render **reconstruía** cada commit desde el repo. Desplegaba el commit verificado, pero no
la imagen verificada. **Nos pasó**: el 21/10, el front de QA quedó sirviendo el bundle anterior con el
deploy marcado `live` y el commit nuevo, porque el cache de build de Render armó una imagen vieja
(TP6, sección 7). El código era idéntico y el resultado, distinto. Una reconstrucción no da lo mismo
aunque el código sea el mismo: cambian la imagen base, las dependencias que se resuelven y el cache.

Ahora la imagen se construye **una sola vez**, en el job que corre los tests, y Render **la ejecuta**
en QA y en PROD. Que es la misma se ve en el digest que Render registra en cada deploy de la corrida
completa: **QA y PROD corren el mismo `sha256`** (`03f80e7…` la API, `c7a48e3…` el front). Lo que las
e2e probaron en QA es, bit a bit, lo que se aprobó para PROD. Y de paso los deploys bajaron de un
minuto (construir) a **10 y 21 segundos** (bajar la imagen y arrancarla).

### 2. Las etiquetas: `sha-<commit>`, `v7.0.0`, y por qué no `latest`

| Etiqueta | Dónde | Qué garantiza |
|---|---|---|
| `sha-<40 caracteres>` | en el registry | de qué commit salió la imagen; la pone el pipeline y sólo desde `main` |
| `v7.0.0` | en git | el nombre de una versión que **anduvo en PROD**: la pone una persona sobre el commit de *Deployments* |
| digest `sha256:…` | lo calcula el registry | el contenido exacto; es lo único que no se puede mover |

**Promuevo por `sha-<commit>`**: la etiqueta sale de `github.sha` de la corrida, así que QA y PROD
reciben la misma, aunque `main` se mueva mientras la corrida espera aprobación.

**No publico `latest`** porque no dice nada: apunta a «lo último que alguien subió», cambia con cada
push y no se sabe qué commit es. Un deploy con `latest` no se puede repetir ni volver atrás con
certeza. Y si un servicio quedara configurado con `latest`, cualquier publicación lo cambiaría por
debajo.

**Si alguien moviera un tag a mano** (por ejemplo, volviera a subir otra imagen como `sha-ec2fd73…`
con un token suyo), un deploy por etiqueta correría esa otra imagen. La etiqueta es un nombre, no una
garantía. La garantía completa sería desplegar por **digest** (`imgURL=…@sha256:…`), que el hook
acepta. No lo hice porque el digest recién se conoce después del build y habría que pasarlo entre
jobs; queda como mejora.

**Con qué imagen configuré Render, y por qué no es la que corre.** Los cuatro servicios los pasé a
*Existing Image* con `sha-9023303…`, la imagen del merge de #42: Render pide una imagen válida para
cambiar la fuente. Lo que corre lo decide **cada deploy del pipeline** con su `imgURL`. Hoy corre
`sha-ec2fd73…` y la configuración sigue diciendo `sha-9023303…`. Por eso *Manual Deploy* en el panel
es peligroso: despliega la imagen de la configuración y llevaría PROD atrás sin avisar.

**No creé servicios nuevos**: les cambié la fuente a los cuatro **por la API de Render** (`PATCH` con
`runtime: image` e `image.imagePath`). Conservan URL, variables, deploy hooks e historial. No hubo
que tocar ningún secret, ni el `BACKEND_URL` de los fronts, ni las URLs del smoke.

### 3. Del tag a la imagen, en un paso

```
git rev-list -n1 v7.0.0                  → ec2fd7393cf0aff1e16710e355c2a85d3fbba866
ghcr.io/santiago6124/ingsoft3-turnos-backend:sha-ec2fd7393cf0aff1e16710e355c2a85d3fbba866
ghcr.io/santiago6124/ingsoft3-turnos-frontend:sha-ec2fd7393cf0aff1e16710e355c2a85d3fbba866
```

El tag da el commit, y el pipeline publicó las dos imágenes con ese commit en la etiqueta. Volver a
esa versión ante un incidente es mandarle esa imagen al hook, sin construir nada.

### 4. Cómo se comprueba desde afuera que un entorno ejecuta MI imagen

- **El commit viaja adentro de la imagen.** El pipeline lo pasa como build arg (`GIT_COMMIT`): en la
  API queda como variable de entorno y `/health` lo devuelve; en el front queda en `/version.txt`. Ya
  no lo pone Render (`RENDER_GIT_COMMIT` dejó de existir al pasar a imagen). Si `/health` dice
  `ec2fd73…`, el proceso que contesta salió de la imagen de ese commit. Si un servicio corriera una
  reconstrucción o una imagen vieja, diría otro.
- **El smoke lo exige**: da verde sólo cuando la API y el front devuelven el commit de la corrida.
  Para comprobarlo no hace falta entrar al panel de Render.
- **En *Events* de Render** cada deploy dice «Triggered via Deploy Hook» y nombra la imagen
  `sha-<commit>` con su digest. Es lo que muestro en vivo en la defensa.

**Lo que el smoke no prueba**: que la app **funcione**. Sabe que corre la imagen correcta, que la
base contesta y que el front llega a su API, pero no que un ciudadano pueda sacar un turno. Eso lo
prueban las e2e.

**Cómo me enteraría si alguien desplegara a mano desde el panel**: `/health` y `/version.txt`
dirían otro commit que el que *Deployments* registra para ese entorno, y en *Events* ese deploy no
diría «Triggered via Deploy Hook» ni tendría una corrida detrás.

### 5. Qué pruebo en integración y qué en e2e

**Integración** (`frontend/e2e/api.spec.js`, 4 pruebas, sin navegador, contra la API de QA):
1. **Alta → la lista la devuelve → `DELETE` → ya no está.** El `GET` le pregunta a Postgres; comprueba
   nombre y fecha tal como se guardaron.
2. y 3. **Alta inválida** (fecha pasada, nombre vacío) → `400` y no se creó nada.
4. **(La elegí yo) Doble reserva**: con un turno confirmado, otro alta en el mismo horario y trámite da
   `409`, y `available-slots` lo muestra ocupado. Es la regla que más importa en una oficina de turnos:
   un horario no se le puede dar a dos personas. La sostienen el controller y un **índice único
   parcial de Postgres** (sólo sobre los confirmados), y esta prueba pasa por los dos. Si se rompe, el
   que escribe es el ciudadano que llega y encuentra a otro en su silla.

**e2e** (`frontend/e2e/turnos.spec.js`, 3 flujos con Chromium, contra el front de QA):
1. **Creación**: un ciudadano saca un turno de Pasaporte, ve «Turno agendado», el admin lo encuentra
   por DNI, lo elimina, y ya no está.
2. **Error**: el ciudadano elige un sábado, ve el aviso «solo de lunes a viernes», no hay horarios, no
   puede agendar, y en la base no quedó nada con su DNI.
3. **(El de todos los días)**: el admin confirma un turno pendiente, la fila dice «Confirmado», y
   sigue así al recargar. Es la tarea diaria del admin: si no anda, los ciudadanos se quedan sin turno
   confirmado y llaman. Toca la base (el cambio de estado persiste).

**Qué NO puse en cada suite (pirámide)**:
- **Ni en integración ni en e2e** van los bordes de la grilla, los filtros uno por uno ni el formato
  del DNI: eso lo cubren los 39 unit tests del backend y los 37 del front, en milisegundos. Repetirlos
  contra QA sería lento y frágil.
- **En e2e no va** la doble reserva: es una regla de la API y la base, y la integración la prueba sin
  navegador. Tampoco cancelar ni los filtros del admin: son variantes del mismo camino.
- **En integración no va** nada de pantalla: si el front manda mal un campo, la integración no se
  entera, porque le habla a la API directamente.

**Por qué no es lo mismo, y el par verde/rojo de mi corrida roja.** La integración prueba que la API
desplegada y su base se entienden. La e2e prueba que **la pantalla** usa bien esa API. En la
[corrida roja](https://github.com/santiago6124/ingsoft3-turnos/actions/runs/39707682856), la
integración quedó **verde** (4 de 4) y la e2e **roja** (los dos flujos que usan el formulario del
ciudadano). Leído contra la tabla de §2.5: **la API y la base están sanas, lo que se rompió es el
front**. No hizo falta abrir el código. El reporte rojo lo confirma: la captura muestra el formulario
completo, con los horarios cargados desde la API, y un botón «Reservar turno» donde el flujo esperaba
«Agendar turno». El pie dice `versión 263e198`, el commit de #44. El tercer flujo, el del admin, que no
usa ese botón, pasó.

Si hubiera roto **la API**, la integración habría quedado roja y la e2e **ni habría corrido**
(`needs: integracion`): no se gasta un navegador en confirmar lo que ya se sabe.

**Qué NO pasó gracias al gate**: `deploy-prod` no arrancó. Ni siquiera pidió aprobación. PROD siguió
en `1fb3bf1` y ningún ciudadano se encontró con un formulario que no le dejaba sacar turno.

**Qué clase de bug el gate no ataja**: lo que mis pocos flujos no recorren (cancelar, los filtros,
otros trámites), lo que sólo pasa con datos o tráfico de producción, el rendimiento, y lo que se ve
mal pero funciona (un botón ilegible pasa la e2e si conserva su nombre).

**Una línea que sólo atraparía la integración**: en el `DbContext`, cambiar el filtro del índice
único a `"Status" = 'Pending'`. Compila, los unit tests usan InMemory (que no aplica índices) y siguen
verdes, y la e2e no prueba la doble reserva. La integración se pone roja: el segundo alta en un
horario confirmado ya no da `409`.

### 6. Por qué integración amplia (contra QA) y no estrecha

La **estrecha** levanta la API dentro del pipeline (`WebApplicationFactory`) con un Postgres
descartable como `services:` del job. La **amplia**, la mía, le habla a la API **ya desplegada** en QA.
- **Gana**: prueba además que el despliegue quedó bien (la imagen, las variables, la cadena de
  conexión, la red hasta Neon), usa la imagen exacta de la corrida, y no hubo que armar nada nuevo.
- **Pierde**: llega más tarde (después del deploy), depende de que QA esté despierto, y comparte QA con
  las e2e y con las otras corridas. Si falla, puede ser la red o el free tier y no mi código.

Con QA ya corriendo la imagen de la corrida, la amplia prueba lo mismo con un décimo de configuración.

### 7. Cold start, tests flaky, y QA compartido

**Cold start**: el smoke de `deploy-qa` ya despertó QA antes de que corran las suites. Igual, cada test
tiene un tope de 60 segundos y cada aserción de 15. Playwright **espera** a que aparezca lo que busca
(los horarios que llegan de la API, la fila después de la búsqueda), sin `sleep` fijos. Nada se
saltea si QA no responde: se pone rojo.

**Un test flaky** es uno que a veces pasa y a veces falla **con el mismo código**. Es peor que no
tener el test porque entrena al equipo a re-correr hasta que dé verde y a ignorar el rojo, y el día
que el rojo es de verdad nadie le cree. Mi configuración tiene **un reintento**: absorbe una demora
suelta de la red, pero el reporte marca **flaky** el test que pasó recién ahí. Hasta ahora no hubo
ninguno. Para no fabricarlos: datos únicos por test (nombre y DNI con la hora, fecha hábil al azar
entre 30 y 300 días adelante), sin dependencias entre tests (`workers: 1` y cada uno prepara lo suyo),
y esperas por condición, nunca por tiempo.

**QA es uno solo y lo comparten todas las corridas.** Cada prueba crea con un DNI propio y **borra lo
que creó, y lo comprueba**. En las e2e la limpieza está en un `afterEach`, que corre aunque el test se
corte por tiempo (sección 9). Me daría cuenta de que una corrida ensució a otra buscando en QA
nombres que empiecen con `e2e ` o `api `: después de cada corrida tiene que dar cero, y dio cero.

**Límite conocido**: con dos merges seguidos, la corrida B puede redesplegar QA mientras las suites de
la A todavía lo usan. Se reconoce mirando qué commit devuelve `/health` de QA contra la hora del
`deploy-qa` de B. Si pasa, la corrida A se rechaza y vale la B, que trae los dos cambios. La regla
mientras tanto es un merge por vez. Un equipo real lo resuelve con un entorno por corrida.

### 8. La misma imagen del front en QA y en PROD

La imagen del front no sabe a qué API hablar. nginx lee `BACKEND_URL` y `DNS_RESOLVER` del entorno al
arrancar (la plantilla del TP6). Render le pone a cada servicio la API de **su** entorno. Adentro de la
imagen quedan el bundle, la plantilla, el commit (`/version.txt`) y los valores por defecto para
compose. Por eso el front de QA y el de PROD corren **el mismo digest** (`c7a48e3…`) y cada uno habla
con su API.

### 9. Problemas encontrados y cómo los resolví

- **Mi API no tenía `DELETE`.** Sin él, ni la integración ni las e2e podían limpiar lo que creaban.
  Lo agregué (204/404) con sus unit tests, y un botón «Eliminar» por fila en el panel del admin. El
  umbral del TP5 siguió pasando (97,96 % de líneas).
- **Con imagen, Render ya no define `RENDER_GIT_COMMIT`**, y mi smoke del TP6 dependía de eso. El
  commit pasó a grabarse en la imagen (`GIT_COMMIT`). En la primera versión, una variable vacía no
  caía al valor siguiente (`??` sólo salta `null`, y el Dockerfile la define vacía si no recibe el
  build arg): lo vi antes de subirlo y lo cambié por «la primera no vacía».
- **Los selectores de las e2e chocaban con los nombres accesibles.** El `<select>` de horario toma el
  texto de su opción («Elegí una **fecha** primero»), así que `getByLabel('Fecha')` encontraba dos
  elementos. Y la celda «Acciones» toma los `aria-label` de sus botones, que incluyen el nombre del
  ciudadano. Lo resolví pidiendo coincidencia exacta. Además, los cuatro botones del menú decían
  «Agendar»: les puse `aria-label="Agendar <trámite>"`, que también ayuda a un lector de pantalla.
- **La limpieza no corría cuando un test se cortaba por tiempo.** En la corrida roja, al llegar al
  minuto, Playwright cerró el contexto y el `finally` falló con «Target page, context or browser has
  been closed». Esa vez no dejó nada, pero podría. Pasó a un `afterEach`; lo probé forzando cortes de
  medio segundo y no quedó ningún resto.
- **El CDN de Playwright se cayó en la primera cadena completa.** `cdn.playwright.dev` devolvió un
  certificado de `*.azureedge.net` y Chromium no se pudo bajar: la e2e falló sin correr un solo test.
  Re-corrí **sólo** ese job, que es válido porque QA seguía con la imagen de esa corrida, y pasó. Si se
  repitiera, la salida es correr el job en la imagen oficial de Playwright, que ya trae el navegador.
- **Aprobé dos veces por error corridas que quería rechazar.** En la del #42 (un paso intermedio,
  todavía con `&ref=`), el comentario decía que no había que pasarla a PROD, pero se apretó *Approve*.
  No pasó nada porque, para entonces, los servicios ya ejecutaban imágenes y Render contestó **400** a
  un pedido con `&ref=`: el job cortó antes del smoke y PROD siguió en `v6.0.0`. Lo cuento porque es
  el mismo error que en el TP6, y lo que lo frenó fue el azar del orden. La lección es leer el botón
  antes de apretarlo; en un equipo, que apruebe otra persona.

### 10. Si mañana cambio Render por otro proveedor de contenedores

Sobrevive casi todo: las imágenes del registry, la cadena de jobs, las dos suites (le hablan a URLs,
no a Render), los environments y el reviewer, y el commit adentro de la imagen. Cambian el comando de
deploy (otro mecanismo en vez del hook con `imgURL`) y las URLs. El contrato con el proveedor es
«ejecutá esta imagen con estas variables», y eso lo ofrecen todos.

### 11. Declaración de uso de IA

**El TP7 lo hice con asistencia de IA** (Claude Code, modelo Claude Opus 5.5), con la IA operando
`git`, `gh`, `docker`, Playwright y la API de Render bajo mi indicación. La IA escribió la spec, el
`DELETE` y sus tests, el commit en la imagen, los cambios de accesibilidad, las dos suites y los jobs
del pipeline, pasó los servicios a imagen por API, y redactó el borrador de este archivo.

**Lo que hice yo**: las decisiones del gate (las aprobaciones, con sus motivos, y los dos errores de
la sección 9 también son míos) y elegir qué flujos importan en mi app. Tengo que poder explicar qué
verifica cada test, contra qué entorno corre y qué pasa si falla: está escrito en la sección 5.

Cómo lo verifiqué:
- **Las 7 pruebas pasaron contra el compose local** antes de subir nada, y se buscaron restos en la
  base después de cada tanda (cero).
- **La limpieza se probó forzando cortes** de medio segundo, no se dio por buena leyendo el código.
- **El cambio a imagen se probó primero en un solo servicio** (el front de QA): un deploy con la
  imagen, sus *Events* y `/version.txt`, antes de tocar los otros tres.
- **La corrida roja se diagnosticó con los reportes**, bajados de la corrida: la captura y el
  contexto del error, contra el reporte verde de la integración.
- **Que QA y PROD corren lo mismo** se comprobó con los digests que Render registra en cada deploy,
  no con el color de los checks.

