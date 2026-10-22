# Spec — TP8: preprod, declarado como código

> Enunciado: `TPs_2026/trabajos/08-iac.md`. Plan y tareas, abajo en este mismo archivo: el TP8 es
> chico en código y grande en lo que hay que poder hacer en vivo.

## Problema

QA y PROD los armé a mano en el TP6: bases creadas por API, servicios creados por API, variables
pegadas, hooks copiados del panel. Si mañana hay que armar otro entorno igual, la receta es mi
memoria y un historial de comandos. Y el equipo necesita un entorno más, `preprod`: parecido a
producción, para probar una release antes de promoverla, que exista sólo cuando se usa.

## Requisitos

- **R1** `infra/` declara `preprod` entero: un proyecto de Neon propio (rol y base `app_preprod`) y
  dos servicios de Render (api y front) corriendo **la imagen de la `v7.0.0`**.
- **R2** Providers fijados: `kislerdm/neon` 0.18.0 y `render-oss/render` 1.9.1, con el
  `.terraform.lock.hcl` commiteado.
- **R3** Ninguna credencial en el HCL: los providers leen `NEON_API_KEY`, `RENDER_API_KEY` y
  `RENDER_OWNER_ID` del entorno (las mías ya están en `~/.config/ingsoft3/credenciales.env`).
- **R4** Se derivan, no se copian: la cadena de conexión (`ConnectionStrings__AppointmentsDb`) se
  arma con lo que devuelve Neon, y el `BACKEND_URL` del front sale del `url` de su api.
- **R5** El estado, los `.terraform/` y los `*.tfvars` en el `.gitignore` **antes** del primer apply.
- **R6** QA y PROD no se tocan: ni se importan ni se modifican.
- **R7** Comprobado como entorno: `/health` y `/api/turnos` de la api de preprod, y el front llegando a su api.
- **R8** Ciclo `destroy → apply` hecho más de una vez, con QA y PROD intactos.
- **R9** `v8.0.0` sobre el commit que deja `infra/` terminado; `decisiones.md` › TP8 en tres renglones.
- **R10** Llegar a la defensa con preprod **destruido**: tiene que poder nacer, no estar vivo.

## Plan

1. `.gitignore` y `infra/main.tf` con la base (Neon). `init → fmt → validate → plan → apply`.
   Segunda pasada: «No changes». Mirar la contraseña dentro del estado.
2. Drift: borrar la base por fuera de Terraform → el plan lo ve → el apply lo repara. Crear una base
   que el código no declara → el plan no la ve.
3. Los dos servicios de Render (`variables.tf`, `outputs.tf`). Apply y comprobación como entorno.
4. `destroy` (mirar el orden real), `apply`, comprobación. `prevent_destroy` negándose. Otra vuelta.
5. Un solo PR con `infra/`, el lock, la spec y `decisiones.md` › TP8. El pase a PROD de esa corrida
   se rechaza (no cambia la app). `v8.0.0` sobre el merge. Preprod destruido al terminar.

## Tareas

- [x] T1 `.gitignore` + Neon: apply, idempotencia, estado por dentro.
- [x] T2 Drift y recurso no declarado.
- [x] T3 Render: api y front de preprod; `/health`, `/api/turnos`, front contra su api.
- [x] T4 `destroy` → `apply` → comprobación; `prevent_destroy`; QA y PROD intactos.
- [ ] T5 PR, rechazo del pase a PROD, `v8.0.0`, preprod destruido.
