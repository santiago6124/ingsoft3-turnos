# Tareas — TP6

- [x] **T1** `ci.yml`: permisos por job, login y publicar como último paso. ✔ PR con «Entrar al registry» salteado (A1).
- [x] **T2** Merge → la corrida de `main` publica las dos imágenes. ✔ publicar es el último paso (A2).
- [x] **T3** Paquetes públicos (Santiago, desde la web). ✔ `docker logout` + `docker pull` (A3).
- [x] **T4** Neon: `app_qa` y `app_prod` en el proyecto «Ingedesoft». ✔ las dos cadenas de conexión conectan.
- [x] **T5** Render: los cuatro servicios en Virginia, Docker, plan free, Auto-Deploy off. ✔ `/health` en 200 en las dos API.
- [x] **T6** Plantilla de nginx + commit en `/health`. ✔ en local, la misma imagen con y sin variables; compose sigue andando.
- [x] **T7** Environment `qa`, sus dos hooks como secrets, job `deploy-qa`. ✔ merge → QA solo → smoke ve el commit (A5).
- [x] **T8** Dato sólo en `app_prod`. ✔ aparece en PROD, no en QA (A4).
- [x] **T9** Environment `production` con reviewer, sus hooks, job `deploy-prod`. ✔ Santiago **rechaza** con motivo (A6).
- [x] **T10** Cambio visible en el front. ✔ Santiago **aprueba**, se ve en PROD (A6).
- [x] **T11** `v6.0.0` sobre el commit de `production`. ✔ (A7).
- [x] **T12** Un cambio más a PROD y rollback a `v6.0.0` por hook. ✔ horas de *Deploys* anotadas (A8).
- [x] **T13** `decisiones.md` › TP6 con «Enlaces de este TP». ✔ Auto-Deploy off y los ids de los hooks revisados (A9).

## Desvíos respecto del plan

- **T9**: la primera corrida que llegó al gate (la de #36) quedó **aprobada** por error: el comentario
  era un motivo de rechazo pero se apretó *Approve*. El rechazo se hizo en la corrida de #37.
- **T9/T10**: el deploy a QA de #37 dejó el front sirviendo el bundle anterior aunque Render lo marcó
  `live` con el commit nuevo (cache de build de Render). Por eso entró #38: el front graba su commit
  en `/version.txt` y el smoke lo exige. El cambio visible aprobado quedó en #38.
- **T12**: el push del merge de #39 disparó su corrida con veinte minutos de demora, y el de #40
  (que se había hecho para relanzarlo) no la disparó nunca. El rollback se hizo por la API de Render
  con el commit de `v6.0.0`, no por el hook: los hooks son secrets y no se pueden volver a leer.
