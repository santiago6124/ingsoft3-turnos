# Tareas — TP9

- [x] **T1** PR 1: spec y `dependabot.yml` → merge. Rechazo del pase a PROD.
- [x] **T2** Alertas y security updates de Dependabot, y CodeQL *default setup*. ✔ primer análisis (A2, A4).
- [x] **T3** Back: `/health` con HEAD, Sentry y `/api/falla`. Front: Sentry. ✔ compose local y umbral 90.
- [x] **T4** `SENTRY_DSN` en la api de PROD. PR 2 → merge → aprobación. ✔ `curl -I` 200 (A1).
- [x] **T5** Monitor sobre PROD, caída y vuelta, monitor pausado (A5).
- [x] **T6** Uso real en PROD y `/api/falla`. Sentry: error, P95, TPM (A6). Tarjeta en el tablero (A7).
- [x] **T7** PR de Dependabot: análisis → merge → aprobación (A3).
- [x] **T8** Práctica: dos hallazgos de CodeQL y la demo de push protection.
- [x] **T9** PR final: sin `/api/falla` y `decisiones.md` › TP9 → aprobación → `v9.0.0` (A8, A9).

## Desvíos respecto del plan

- **T2**: los ajustes de *Settings → Advanced Security* se prendieron por la API de GitHub, no desde el
  panel. Se ven igual en el panel.
- **T3/T4**: CodeQL encontró cuatro hallazgos reales en el pipeline (`actions/missing-workflow-permissions`),
  y el arreglo entró en el mismo PR 2. No hizo falta provocar hallazgos en una rama aparte.
- **T5**: el monitor, la caída (*suspend*/*resume*) y la pausa se hicieron por las APIs de UptimeRobot
  y de Render.
- **T6**: el uso de PROD fue mixto: tres corridas de las suites del TP7 contra PROD (crean y borran lo
  suyo) y unos minutos de uso a mano. Los números se leyeron con la API de Sentry, con un token
  personal de sólo lectura.
- **T7**: el PR elegido fue una actualización de seguridad (#66, undici), no una de las semanales: las
  semanales eran todas saltos mayores.
