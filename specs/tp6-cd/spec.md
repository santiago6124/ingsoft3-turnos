# Spec — TP6: entrega continua, entornos y el gate humano

> Escrita antes de tocar código. El cómo está en [`plan.md`](plan.md) y el orden en
> [`tasks.md`](tasks.md). Enunciado: `TPs_2026/trabajos/06-cd-environments.md`.

## Problema

El pipeline del TP5 verifica (tests, cobertura, umbral) pero **no entrega nada**: la imagen que pasó
los tests se construye y se tira. Las únicas imágenes publicadas son las `v0.1.x` del TP2, que subí
a mano desde mi máquina y que nadie verificó. No hay ningún entorno fuera de mi notebook: para
mostrar la app hay que levantar el compose. Y a la pregunta «¿qué versión está corriendo y cómo
volvemos atrás?» hoy no hay respuesta.

## Requisitos

### R1 · El artefacto (Tarea 1)
- R1.1 Cada job publica su imagen en `ghcr.io/santiago6124/ingsoft3-turnos-{backend,frontend}`,
  etiquetada `sha-<commit>`, **sólo** en un `push` a `main`.
- R1.2 Publicar es el **último paso** del mismo job que corre los tests: si los tests fallan, no se llega.
- R1.3 Los dos paquetes son públicos: `docker pull` sin credenciales.

### R2 · Dos entornos reales (Tarea 2)
- R2.1 QA y PROD en Render, cada uno con back y front como contenedores construidos con mis
  Dockerfiles, y una base **distinta** por entorno en Neon (`app_qa`, `app_prod`).
- R2.2 La dirección del backend **no está dentro de la imagen del front**: nginx la lee del entorno
  al arrancar. La misma imagen sirve en QA y en PROD.
- R2.3 Environments `qa` y `production` en GitHub; los secrets de deploy viven **dentro** de su environment.

### R3 · Promoción automática a QA (Tarea 3)
- R3.1 Push a `main` → CI verde → deploy a QA disparado **por el pipeline** con el **commit
  verificado** (`&ref=$GITHUB_SHA`). Auto-Deploy de Render apagado en los cuatro servicios.
- R3.2 Smoke test con reintentos y `--max-time`: API viva, base que responde, front servido.
- R3.3 El smoke comprueba además **qué commit corre** (`/health` devuelve el commit) y falla si no
  es el verificado. Así no da verde contra la versión vieja mientras Render construye.

### R4 · El gate humano (Tarea 4)
- R4.1 Environment `production` con required reviewer (yo) y *Prevent self-review* apagado.
- R4.2 Una corrida **rechazada con un motivo propio y concreto**, y otra aprobada con un cambio
  **visible** en el front de PROD.

### R5 · Release y rollback (Tareas 5 y 6)
- R5.1 `v6.0.0` sobre el commit que está en PROD (sacado de *Deployments*, no de la punta de `main`).
- R5.2 Un rollback hecho de verdad y **cronometrado** con las horas de *Deploys* de Render.
- R5.3 Deployment pattern para una producción real, justificado.

### R6 · Entrega
- `decisiones.md` › TP6 con la sección «Enlaces de este TP» arriba (paquetes, las dos corridas de la
  cadena, URLs de QA y PROD) y todo lo que piden los Entregables.

## Fuera de alcance
- Que Render ejecute **la imagen publicada** en vez de reconstruir: es el TP7. Acá queda dicho qué
  garantía se pierde.
- Infraestructura como código: los servicios se crean por API una vez; Terraform es el TP8.

## Criterios de aceptación

| # | Comprobación | Dónde se ve |
|---|---|---|
| A1 | Job de un PR con tests verdes y «Entrar al registry» **salteado** | `…/actions/runs/<id>/job/<id>` |
| A2 | Corrida de `main` donde publicar es el último paso | `…/actions/runs/<id>` |
| A3 | `docker logout ghcr.io && docker pull` de los dos paquetes funciona | terminal |
| A4 | Un dato insertado sólo en `app_prod` aparece en PROD y no en QA | SQL Editor de Neon + las dos URLs |
| A5 | Un merge despliega QA solo, el smoke ve el commit nuevo en `/health` | *Actions* + *Deployments* |
| A6 | Una corrida rechazada con motivo; otra aprobada con el cambio visible en PROD | *Actions* |
| A7 | `v6.0.0` apunta al commit que *Deployments* dice que está en `production` | Releases |
| A8 | Rollback medido con las horas de *Deploys* de Render, anotado | `decisiones.md` |
| A9 | Auto-Deploy `Off` en los cuatro servicios; los hooks de PROD apuntan a los servicios de PROD | panel de Render |
