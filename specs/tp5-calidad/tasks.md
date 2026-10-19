# Tareas — TP5

Orden de ejecución. Cada tarea cierra con su comprobación; si la comprobación no da, no se sigue.

- [ ] **T1** Backend: `[Theory]` de bordes de la grilla. ✔ `dotnet test` verde; invertir `<=` por `<` en `IsSlotStartTime` pone rojo el caso 15:45.
- [ ] **T2** Backend: tests de `AvailableSlotsController`. ✔ verde; sacar el filtro `Status == Confirmed` pone rojo el del pendiente.
- [ ] **T3** Backend: tests de filtros de `List` + estado inválido. ✔ verde.
- [ ] **T4** Backend: test con mock de `IScheduleService` (Moq). ✔ verde; borrar la llamada a `IsSlotValid` lo pone rojo.
- [ ] **T5** Frontend: refactor de `api.ts` (`fetcher` inyectable, `buildAppointmentsQuery`). ✔ `npm run build` compila; la app en compose lista turnos igual.
- [ ] **T6** Frontend: `api.test.ts` con `it.each`, error y mock. ✔ `npm test` verde.
- [ ] **T7** Medir los dos lados con las exclusiones; elegir el umbral. ✔ números anotados para `decisiones.md`.
- [ ] **T8** Dockerfiles: etapa `test` en los dos. ✔ `docker build --target test` + `docker run` local pasan; la imagen `final` sigue siendo la misma.
- [ ] **T9** `ci.yml`: los cuatro pasos por job. ✔ primera corrida del PR A verde, con las dos tablas y dos artefactos (A3).
- [ ] **T10** PR A: `src/agenda.ts` sin tests. ✔ corrida roja **por umbral** con los tests verdes (A4).
- [ ] **T11** PR A: un test por camino de `agenda.ts`. ✔ verde → merge.
- [ ] **T12** PR B desde `main`: regla nueva en el backend sin tests. ✔ rojo por cobertura; queda abierto (A5).
- [ ] **T13** `decisiones.md` › TP5 con las URLs + camino sin cubrir. `v5.0.0` y su release (A7).
