# Plan — TP9

## PR 1 · Spec y Dependabot (sólo config)
- `specs/tp9-devsecops/` y `.github/dependabot.yml`. Dependabot lee la config de `main`, así que va primero.
  Mientras se hace el resto, ya van llegando sus PRs.
- En GitHub (por API o panel): *Dependabot alerts*, *security updates* y CodeQL *default setup*.
- No cambia la app: el pase a PROD **se rechaza**.

## PR 2 · La app observable
- **Back**: `/health` pasa de `MapGet` a `MapMethods(GET, HEAD)`. `Sentry.AspNetCore` en `Program.cs`, con
  `SENTRY_DSN` del entorno y `Release = commit`. `GET /api/falla` temporal, que tira una excepción.
- **Front**: `@sentry/react` en `main.tsx`, con tracing de navegador.
- Antes del merge: `SENTRY_DSN` en la api de **PROD** por la API de Render. Agregar la variable no
  despliega nada; la toma el deploy de este PR.
- Compose local: `HEAD /health` → 200, `/api/falla` → 500 y la app anda sin DSN. Umbral del TP5 intacto.
- Merge → cadena verde → **se aprueba** → PROD con Sentry.

## Con PROD nueva
- `curl -I` → 200. Monitor de UptimeRobot por API, con el contacto de mail de la cuenta.
- Caída: *suspend* de la api de PROD por la API de Render. Esperar el DOWN, *resume*, despertar
  `/health` a mano y esperar el UP. Anotar las horas. **Pausar el monitor.**
- Usar PROD unos minutos (listar, agendar, confirmar, borrar) y llamar a `/api/falla` dos veces.
- Sentry: el issue, P95 y TPM por transacción. Con el dato, una tarjeta en el tablero.

## PR de Dependabot
- Elegir uno que toque la app (no sólo actions), leer el changelog y ver la cadena en verde. Si la rama
  quedó atrás, comentar `@dependabot rebase`. Merge → aprobación → PROD.

## Práctica (no se mergea nada)
- CodeQL: si no encuentra nada, una rama con un hallazgo provocado (input del usuario a un log o a una
  respuesta sin sanitizar, y un secreto inventado), un PR para que lo analice, y se cierra sin mergear.
- Push protection: el PAT sin scopes lo crea y lo revoca el dueño de la cuenta. La demo es en su terminal.

## PR final · Cierre
- Se saca `/api/falla`, y en `decisiones.md` va la sección TP9 con sus enlaces. Cambia la app, así que
  **se aprueba** → `v9.0.0` sobre ese commit.
