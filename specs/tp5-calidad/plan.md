# Plan — TP5

Cómo se cumple cada requisito de [`spec.md`](spec.md). Las decisiones que el enunciado pide
justificar se justifican en `decisiones.md`; acá queda el diseño.

## Backend

**Tests nuevos** (`backend/Turnos.Api.Tests/`):

| Regla | Archivo | Qué entra |
|---|---|---|
| Grilla horaria | `Services/ScheduleServiceTests.cs` | Los `[Fact]` de validez se pasan a un `[Theory]` con los bordes (R1.2) |
| Horarios disponibles | `Controllers/AvailableSlotsControllerTests.cs` (nuevo) | Un confirmado ocupa su horario; un pendiente o un cancelado no; otro trámite no ocupa; día no hábil devuelve vacío |
| Filtros del listado | `Controllers/AppointmentsListTests.cs` (nuevo) | Estado inválido da 400 (caso de error); filtro por estado, fecha, trámite y búsqueda por nombre o DNI |
| Interacción con la grilla | `Controllers/AppointmentsControllerMockTests.cs` (nuevo) | **Mock** de `IScheduleService` con Moq: si la grilla rechaza, el controller devuelve 400, **no escribe en la base** y consultó la grilla una vez con la fecha exacta (`Verify`) |

No hace falta refactorizar para el mock: `AppointmentsController` ya recibe `IScheduleService` por
constructor. El hallazgo honesto es otro: **`Create` lee `DateTime.Now` adentro**, y por eso los tests
existentes usan `NextThursdayAt`. No se refactoriza en este TP y queda anotado como deuda.

**Etapa de tests** en `backend/Dockerfile`, entre `build` y `final`: `FROM build AS test` y un
`ENTRYPOINT` en *exec form* con `dotnet test`, `coverlet.msbuild` (`CollectCoverage`, `Threshold`,
`ThresholdType=line%2cbranch`, `Exclude`) y `--logger trx` hacia `/out`. La etapa `build` ya copia el
`.csproj` de tests antes del restore (lo hice en el TP2), así que `FROM build` encuentra la suite.

**Qué se excluye** (la misma lista en coverlet y en ReportGenerator):
- `Program` — el arranque: DI, CORS, migraciones al iniciar. Se prueba levantando la app, no con un unit test.
- `Turnos.Api.Migrations.*` — código **generado** por EF.
- `Turnos.Api.Data.*` — el `DbContext`, configuración de EF.
- `Turnos.Api.Models.*` y `Turnos.Api.Options.*` — clases que sólo tienen propiedades.

Los DTOs **quedan adentro**: `AppointmentResponseDto.FromEntity` tiene lógica de mapeo (el estado
pasa a texto) y el front depende de ese texto.

**Umbral**: se elige **después** de medir con la suite completa. Regla: un número redondo, unos
puntos debajo de lo medido, en línea **y** rama. Si lo pongo exacto, cualquier cambio legítimo lo rompe.

## Frontend

**Refactor para el mock** (R2.2): `request()` de `src/api.ts` hoy usa el `fetch` global. Pasa a
recibir el cliente como parámetro opcional (`fetcher = fetch`), así los componentes no cambian. Se
separa además `buildAppointmentsQuery(filters)`: armar la query es lógica pura y hoy está pegada a la red.

**Tests nuevos** (`src/api.test.ts`):
- `it.each` sobre `buildAppointmentsQuery`: sin filtros, uno solo, todos, valores con espacios y tildes.
- Caso de error: la API contesta 409 con `{ error }` → `request` rechaza con **ese** mensaje; sin
  cuerpo JSON → `Error 500`.
- Mock: `vi.fn()` como `fetcher`; se verifica la URL y el método que recibió y el resultado que devuelve.

**Qué se mide**: `include: ['src/*.ts']` (la lógica: `format.ts`, `api.ts`, `services.ts`), sin los
`*.test.ts` ni `*.d.ts`. Los componentes `.tsx` quedan fuera de la cuenta: son UI, y su test
(`AdminView.test.tsx`) usa DOM. Si los midiera, el número diría cuánto renderizo y no cuánta lógica verifico.

**Etapa de tests** en `frontend/Dockerfile`, en el medio: `FROM build AS test` + `ENTRYPOINT
["npm","run","test:ci"]`. `test:ci` es la única receta, la misma en mi máquina y en el contenedor.
`@vitest/coverage-v8` fijado a la versión **exacta** de vitest (2.1.9).

## Pipeline (`.github/workflows/ci.yml`)

Cuatro pasos al final de cada job **existente** (no hay jobs nuevos, así que los required checks del
TP4 frenan solos): construir la etapa `test` (`target: test`, `load: true`, `scope` propio), `docker
run` con el volumen, el Summary (`if: !cancelled()`) y el artefacto. Versiones de las actions: las
mismas mayores del TP4, para no mezclar cambios en este PR.

## Demostración del gate

- **PR A** (esta rama, `tp5/calidad`): primero verde con todo lo de arriba. Después un archivo nuevo
  **en el front**, `src/agenda.ts`, que convierte la fecha de un turno en un aviso para el ciudadano
  («Hoy», «Mañana», «En N días», «Ya pasó»), sin tests → rojo por umbral. Después un test por cada
  camino → verde → merge.
- **PR B** (desde `main` ya mergeado): una regla nueva **en el backend** sin tests, para que el freno
  quede probado del otro lado. Tamaño calculado contra el reporte para que el número caiga de verdad
  debajo del umbral. Queda abierto.
