# Spec — TP7: la imagen como release, integración y e2e

> Escrita antes de tocar código. El cómo está en [`plan.md`](plan.md) y el orden en
> [`tasks.md`](tasks.md). Enunciado: `TPs_2026/trabajos/07-contenedores-e2e.md`.

## Problema

En el TP6 Render **reconstruye** cada commit desde el repo: lo que corre no es la imagen que pasó
los tests. Ya nos mordió: el 21/10 el front de QA quedó sirviendo un bundle viejo con el deploy
marcado `live` (cache de build de Render). Además, nada prueba que la app **funcione**: el smoke
sabe que contesta, no que un ciudadano pueda sacar un turno. Y la API no tiene forma de borrar un
turno, así que ninguna prueba contra QA podría limpiar lo que crea.

## Requisitos

### R1 · Los entornos ejecutan la imagen (Tarea 1)
- R1.1 Los cuatro servicios de Render pasan a *Existing Image* (se les cambia la fuente; no se crean de nuevo).
- R1.2 El pipeline les dice qué imagen correr con `imgURL=ghcr.io/…:sha-<commit>`; el `&ref=` desaparece.
- R1.3 **Se comprueba desde afuera**: el commit está **grabado en la imagen** (`GIT_COMMIT`, build arg del
  pipeline) y lo devuelven `/health` (api) y `/version.txt` (front). El smoke lo exige.

### R2 · Integración contra la api de QA (Tarea 2)
- `frontend/e2e/api.spec.js`, fixture `request`, sin navegador ni dobles, contra `API_BASE_URL` (la api de QA):
  - (a) alta → la lista la devuelve → `DELETE` → ya no está.
  - (b) alta inválida (fecha pasada, nombre vacío) → `400` y no se creó nada.
  - (c) **doble reserva**: con un turno confirmado, otro alta en el mismo horario y trámite → `409`, y
    `available-slots` muestra el horario ocupado. Es la regla que protege el índice único de Postgres.
- Nombres únicos con la hora adentro; cada prueba borra lo que crea y lo comprueba.

### R3 · e2e contra el front de QA (Tarea 3)
- `frontend/e2e/turnos.spec.js`, con Chromium, contra `E2E_BASE_URL` (el front de QA):
  - **Creación**: el ciudadano saca un turno → lo ve confirmado → el admin lo encuentra → lo elimina → ya no está.
  - **Error**: el ciudadano elige un sábado → ve el aviso → no puede agendar → no se creó nada.
  - **Diario**: el admin confirma un turno pendiente → dice «Confirmado» → sigue así al recargar.
- Sin `page.route`, sin mocks, sin `test.skip`. El cold start se maneja con timeouts.

### R4 · El gate (Tarea 4)
- `deploy-qa → integracion → e2e → deploy-prod`, todo en el mismo workflow y el mismo push.
- Nada que desarme el gate (`continue-on-error`, `|| true`, `always()` fuera de los pasos de reporte).
- Evidencia: un commit que rompe **el front** → integración verde, e2e roja, `deploy-prod` sin
  arrancar → fix → cadena verde → aprobación → PROD con **la misma imagen** que QA.

### R5 · Release (Tarea 5)
- `v7.0.0` sobre el commit que *Deployments* dice que está en `production`.

### Lo que la app necesita para todo lo anterior
- `DELETE /api/turnos/{id}` (204 / 404) y un botón «Eliminar» por fila en el panel del admin.
- Nombres accesibles: búsqueda con label, botones por fila con `aria-label` («Confirmar turno de X»),
  avisos de error con `role="alert"`.

## Criterios de aceptación

| # | Comprobación |
|---|---|
| A1 | Las seis pruebas pasan contra el compose local antes de subir nada |
| A2 | En *Events* de los cuatro servicios: «Triggered via Deploy Hook» con `sha-<commit>`; `/health` y `/version.txt` dicen ese commit |
| A3 | Corrida roja: smoke verde, integración verde, e2e roja, `deploy-prod` sin arrancar; los dos reportes como artefactos |
| A4 | Corrida verde posterior hasta PROD con el mismo `imgURL` en QA y en PROD |
| A5 | `v7.0.0` = commit de `production` en *Deployments*; su `sha-` está en los dos paquetes |
| A6 | `decisiones.md` › «Enlaces del TP7» arriba y la sección TP7 |
