# Plan — TP7

## PR 1 · La app y las suites (todavía con el deploy del TP6)
- **Backend**: `DELETE /api/turnos/{id}` con sus unit tests (el umbral del TP5 sigue en 90). El
  Dockerfile graba `GIT_COMMIT` en la etapa final; `/health` lo prefiere a `RENDER_GIT_COMMIT`.
- **Front**: `deleteAppointment` en `api.ts` (con su fila en el `it.each` de endpoints), botón
  «Eliminar» por fila, `aria-label` en la búsqueda y en los botones de cada fila, `role="alert"` en
  los avisos de error del formulario.
- **Playwright**: `@playwright/test`, `playwright.config.js`, `e2e/api.spec.js` y `e2e/turnos.spec.js`.
  vitest excluye `e2e/**`. Se prueban las seis contra el compose local.
- **Pipeline**: el build del backend pasa `GIT_COMMIT` como build arg.
- Al mergear, QA se reconstruye como en el TP6. El pase a PROD de esa corrida **se rechaza**: es un paso intermedio.

## Entre PR 1 y PR 2 · Render
- Los cuatro servicios pasan a *Existing Image* con la imagen `sha-` del merge de PR 1 (por API si
  Render lo permite; si no, desde el panel). Cambiar la fuente no despliega nada.
- Un deploy de prueba en el front de QA con esa imagen, para ver que Render la baja.

## PR 2 · El pipeline
- `deploy-qa` y `deploy-prod` mandan `imgURL` en vez de `&ref=`.
- Jobs `integracion` (`needs: deploy-qa`, sin browser) y `e2e` (`needs: integracion`, Chromium), cada
  uno con su reporte como artefacto (`playwright-report-integracion`, `playwright-report-e2e`).
- `deploy-prod` pasa a `needs: e2e`.
- Esta corrida es la primera cadena completa: se **aprueba**.

## PR 3 y PR 4 · La evidencia
- PR 3 rompe el front: el botón «Agendar turno» pasa a decir otra cosa. Sin tocar `e2e/`. Ningún unit
  test del front mira ese texto. Integración verde, e2e roja.
- PR 4 lo arregla → cadena verde → aprobación → `v7.0.0`.

## PR 5 · Docs
- `decisiones.md` › TP7 y los enlaces arriba. El pase a PROD de esa corrida se rechaza (sólo docs).

## Datos de prueba en QA
Cada prueba usa un nombre con la hora (`api 1729…`, `e2e 1729…`) y una fecha hábil al azar entre 30 y
300 días adelante, para no chocar con otras corridas ni con datos manuales. Todas borran lo que crean.
