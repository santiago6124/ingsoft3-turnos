# Tareas — TP7

- [x] **T1** Backend: `DELETE` + tests; `GIT_COMMIT` en la imagen y en `/health`. ✔ 90 % sigue pasando.
- [x] **T2** Front: eliminar, nombres accesibles, `role="alert"`. ✔ unit tests y umbral.
- [x] **T3** Playwright: config y las dos suites. ✔ seis verdes contra el compose local (A1).
- [x] **T4** PR 1 → merge → QA reconstruido con el `DELETE`. Rechazo del pase a PROD.
- [x] **T5** Render: los cuatro servicios a *Existing Image*; deploy de prueba del front de QA.
- [x] **T6** PR 2: `imgURL`, jobs `integracion` y `e2e`, `deploy-prod` con `needs: e2e`. ✔ cadena completa, aprobación (A2, A4).
- [x] **T7** PR 3: romper el front. ✔ integración verde, e2e roja, PROD intacto (A3).
- [x] **T8** PR 4: arreglo → aprobación → `v7.0.0` (A5).
- [x] **T9** `decisiones.md` › TP7 (A6).

## Desvíos respecto del plan

- **T4**: la corrida de #42 se aprobó por error (el comentario era de rechazo); su `deploy-prod` falló
  con 400 porque los servicios ya eran de imagen, y PROD no se tocó.
- **T5**: el cambio a *Existing Image* se hizo por la API de Render (`PATCH`), no desde el panel.
- **T6**: la primera e2e de la cadena falló instalando Chromium (CDN de Playwright caído); se re-corrió
  sólo ese job.
- **T8**: el arreglo de #45 sumó la limpieza de las e2e en un `afterEach`, por lo que mostró la corrida roja.
