# Plan — TP6

## El artefacto (§3.0 de la guía)

En los dos jobs: `permissions: { contents: read, packages: write }` **por job** (mínimo
privilegio), «Entrar al registry» con el `GITHUB_TOKEN` y el build de la imagen final **movido al
final**, con `push` atado a `push` + `refs/heads/main`. Nombre de paquete: el del repo
(`ingsoft3-turnos-backend`), porque así nace vinculado al repo y el `GITHUB_TOKEN` puede escribir.
Los paquetes `turnos-*` del TP2 los subí a mano y no están vinculados: quedan como historia y los
sigue usando `docker-compose.registry.yml`.

## Los entornos

| | QA | PROD |
|---|---|---|
| Base (Neon, proyecto «Ingedesoft», `aws-us-east-1`) | `app_qa` | `app_prod` |
| API (Render, Docker, `backend/`) | `turnos-api-qa` | `turnos-api-prod` |
| Front (Render, Docker, `frontend/`) | `turnos-front-qa` | `turnos-front-prod` |

- Render en **Virginia**, la misma región de AWS que Neon: la API y la base quedan cerca.
- Los servicios los creo **por la API de Render**, una sola vez, con Auto-Deploy apagado. Todo lo
  que configuro queda escrito en `decisiones.md`; que sea código versionado es el TP8.
- Variables de la API: `ConnectionStrings__AppointmentsDb` (la de **su** base) y `PORT=8080`.
- Variables del front: `BACKEND_URL` (la API de **su** entorno, sin barra final),
  `DNS_RESOLVER=8.8.8.8`, `PORT=80`.
- Las tablas las crea la app al arrancar (`Database.Migrate()` en `Program.cs`, desde el TP2).

## El front sin la dirección adentro

`frontend/nginx.conf` → `frontend/default.conf.template` (con `git mv`): `resolver ${DNS_RESOLVER}`
y `set $backend_api ${BACKEND_URL}`, más `proxy_ssl_server_name on` porque la API de Render es
https. El Dockerfile copia la plantilla a `/etc/nginx/templates/` y deja `BACKEND_URL` y
`DNS_RESOLVER` por defecto con los valores de compose, así el `docker compose up` del TP2 no cambia.

## El commit en `/health`

`/health` agrega `commit`, leído de `RENDER_GIT_COMMIT`: Render la define en cada servicio
construido desde git con el commit que desplegó. Sin esa variable (compose, tests), devuelve
`"local"`. El smoke compara ese valor con `$GITHUB_SHA` y sólo da verde cuando coinciden. Es la
mitigación que la guía deja opcional acá y obligatoria en el TP7.

## La cadena de jobs

```
build-backend ─┐
               ├─▶ deploy-qa (if main · environment: qa) ─▶ deploy-prod (environment: production ⏸)
build-frontend ┘
```

- Los hooks se llaman con `&ref=$GITHUB_SHA`.
- Smoke: 30 vueltas × 20 s, `--max-time 10`. Comprueba `/health` (con el commit), `/api/turnos`
  (toca la base) y el front.
- `deploy-prod` lleva `concurrency: { group: deploy-prod, cancel-in-progress: false }`.

## Los PRs

1. **Publicar la imagen** (§3.0) → merge → paquetes públicos (lo hace Santiago desde la web: la
   visibilidad no se cambia por API y no tiene vuelta atrás).
2. **Deploy a QA**: plantilla de nginx, commit en `/health`, job `deploy-qa`, environment `qa` y sus secrets.
3. **Deploy a PROD**: environment `production` con reviewer, job `deploy-prod`. Su corrida es la
   que **se rechaza**.
4. **Un cambio visible** en el front → se **aprueba** → PROD. Sobre ese commit va `v6.0.0`.
5. **Un cambio más** aprobado, y después el **rollback** a `v6.0.0` por hook, cronometrado.
6. **Docs**: `decisiones.md` › TP6.
