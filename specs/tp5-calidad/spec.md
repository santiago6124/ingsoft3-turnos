# Spec — TP5: calidad automatizada

> Spec escrita **antes** de tocar código. Dice qué tiene que ser verdad al terminar y cómo se
> comprueba; el cómo está en [`plan.md`](plan.md) y el orden en [`tasks.md`](tasks.md).
> Enunciado: `TPs_2026/trabajos/05-testing-calidad.md` (sección «Trabajo Práctico 05»).

## Problema

El pipeline del TP4 compila y construye las imágenes, pero **no corre un solo test**. La app tiene
18 tests de backend y 8 de frontend que sólo corren en mi máquina, si me acuerdo. Medido hoy
(19/10) con `coverlet.collector`:

| Qué | Líneas | Comentario |
|---|---|---|
| Todo el ensamblado | 39 % | arrastrado por `Program`, migraciones y el `DbContext` |
| `ScheduleService` | 30/31 | la grilla horaria está bien cubierta |
| `AppointmentsController.Create` | 31/31 | crear turno, cubierto |
| `AppointmentsController.List` | **0/32** | los filtros del panel de admin: **ningún test** |
| `AvailableSlotsController` | **0/26** | los horarios que ve el ciudadano: **ningún test** |

Los dos agujeros son justo lo que el ciudadano y el admin usan primero. Un bug en
`AvailableSlotsController` le muestra libre un horario que ya está confirmado, y el pipeline queda en verde.

## Requisitos

### R1 · Suite de backend (Tarea 1)
- R1.1 ≥ 8 métodos de test AAA sobre **≥ 4 reglas distintas**: grilla horaria, alta de turno,
  transiciones de estado, horarios disponibles, filtros del listado.
- R1.2 Al menos un `[Theory]` con los **bordes** de la grilla (8:45, 9:00, 15:45, 16:00, 9:05, segundos ≠ 0).
- R1.3 Al menos un caso de error (input inválido o borde).
- R1.4 **Un test con mock** (Moq) sobre una dependencia real del controller (`IScheduleService`), que
  verifique la **interacción** y no sólo el resultado: es lo que lo separa de un stub.
- R1.5 Criterio de valor: invertir una regla (`<` por `<=`, `&&` por `||`) pone algo en rojo.

### R2 · Suite de frontend (Tarea 1)
- R2.1 ≥ 4 unit tests **sin DOM**, con `it.each`, un caso de error y un mock (`vi.fn()`).
- R2.2 El mock entra por **parámetro**: el cliente HTTP (`fetch`) se inyecta en vez de tomarse del
  global. Si el código no tiene por dónde meterlo, se refactoriza (y se cuenta).

### R3 · Cobertura medida y umbral que rompe el build (Tarea 2)
- R3.1 Los tests corren **adentro del pipeline**, en una etapa `test` de cada Dockerfile (entre
  `build` y `final`). La imagen final no cambia.
- R3.2 Summary de la corrida con línea **y rama**, de los dos lados, y reporte descargable (artefacto).
- R3.3 Umbral en el backend con `coverlet.msbuild`, y en el frontend con `thresholds` de vitest.
  Debajo del número, el job falla **aunque todos los tests pasen**.
- R3.4 Lo excluido del umbral es **lo mismo** que lo excluido del reporte (una sola definición de
  «qué se mide»), y se excluye con `Exclude`, no con `Include`.
- R3.5 El número se elige **contra la medición real**, con margen, y se justifica.

### R4 · El umbral frena un merge (Tarea 3)
- R4.1 `build-backend` y `build-frontend` siguen siendo required checks de `main` (vienen del TP4).
- R4.2 **PR A**: código nuevo sin tests → rojo **por cobertura** con tests verdes → tests → verde → merge.
- R4.3 **PR B**: desde `main` ya mergeado, otro código sin tests, **abierto y en rojo hasta la defensa (30/10)**.

### R5 · Entrega
- R5.1 `decisiones.md` › TP5 con todo lo que pide «Entregables», **cada decisión con la URL que la
  prueba** (corrida o PR concretos), incluido el ejercicio del camino sin cubrir.
- R5.2 Tag `v5.0.0` con su release sobre el commit a corregir, en `main`.

## Fuera de alcance
- Tests de integración contra Postgres real y e2e (TP7).
- Análisis estático en el pipeline (CodeQL entra en el TP9).
- Subir la cobertura de los componentes React: son UI, se cuentan aparte (ver plan).

## Criterios de aceptación (cómo sé que terminé)

| # | Comprobación | Dónde se ve |
|---|---|---|
| A1 | `dotnet test` local con el umbral pasa; bajando el umbral por encima del número real, falla con el mensaje de coverlet | terminal |
| A2 | `npm run test:ci` pasa; comentando un test que cubre un camino, falla con `ERROR: Coverage for …` | terminal |
| A3 | Una corrida de CI con las dos tablas (back y front) en el Summary y dos artefactos | `…/actions/runs/<id>` |
| A4 | PR A con una corrida roja **por umbral** (tests en verde en el mismo log) y después mergeado | `…/pull/<n>` |
| A5 | PR B abierto, con un required check en rojo por cobertura | `…/pull/<m>` |
| A6 | La app levanta con `docker compose up` y `/health` da 200: el refactor no rompió la inyección | terminal |
| A7 | `v5.0.0` publicado; `decisiones.md` › TP5 con las URLs de A3, A4 y A5 | Releases |
