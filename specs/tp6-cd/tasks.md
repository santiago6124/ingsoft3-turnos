# Tareas — TP6

- [ ] **T1** `ci.yml`: permisos por job, login y publicar como último paso. ✔ PR con «Entrar al registry» salteado (A1).
- [ ] **T2** Merge → la corrida de `main` publica las dos imágenes. ✔ publicar es el último paso (A2).
- [ ] **T3** Paquetes públicos (Santiago, desde la web). ✔ `docker logout` + `docker pull` (A3).
- [ ] **T4** Neon: `app_qa` y `app_prod` en el proyecto «Ingedesoft». ✔ las dos cadenas de conexión conectan.
- [ ] **T5** Render: los cuatro servicios en Virginia, Docker, plan free, Auto-Deploy off. ✔ `/health` en 200 en las dos API.
- [ ] **T6** Plantilla de nginx + commit en `/health`. ✔ en local, la misma imagen con y sin variables; compose sigue andando.
- [ ] **T7** Environment `qa`, sus dos hooks como secrets, job `deploy-qa`. ✔ merge → QA solo → smoke ve el commit (A5).
- [ ] **T8** Dato sólo en `app_prod`. ✔ aparece en PROD, no en QA (A4).
- [ ] **T9** Environment `production` con reviewer, sus hooks, job `deploy-prod`. ✔ Santiago **rechaza** con motivo (A6).
- [ ] **T10** Cambio visible en el front. ✔ Santiago **aprueba**, se ve en PROD (A6).
- [ ] **T11** `v6.0.0` sobre el commit de `production`. ✔ (A7).
- [ ] **T12** Un cambio más a PROD y rollback a `v6.0.0` por hook. ✔ horas de *Deploys* anotadas (A8).
- [ ] **T13** `decisiones.md` › TP6 con «Enlaces de este TP». ✔ Auto-Deploy off y los ids de los hooks revisados (A9).
