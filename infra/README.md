# infra/ — el entorno `preprod`, declarado

Un entorno entero entre QA y PROD: un proyecto de Neon propio (rol y base `app_preprod`) y dos
servicios de Render (api y front) que corren la imagen de la release `v7.0.0`. **No existe hasta que
se aplica**, y se destruye cuando no se usa. QA y PROD no están declarados acá y no se tocan.

## Crearlo y destruirlo

```bash
cd infra
source ~/.config/ingsoft3/credenciales.env   # exporta NEON_API_KEY, RENDER_API_KEY, RENDER_OWNER_ID
                                             # (cualquier forma de exportarlas sirve: no van en ningún archivo del repo)
terraform init        # la primera vez en una máquina: baja los providers que fija el .terraform.lock.hcl
terraform plan        # 5 to add: proyecto, rol y base en Neon; api y front en Render
terraform apply       # ~1 minuto: termina cuando los dos servicios están live

# comprobarlo como entorno
curl -fsS "$(terraform output -raw api_url)/health"       # vida + base + el commit de la imagen
curl -fsS "$(terraform output -raw api_url)/api/turnos"   # la api hablando con SU base
open "$(terraform output -raw front_url)"                 # el front, contra su api

terraform destroy     # 5 to destroy, en ~10 s: front, api, base, rol, proyecto (el grafo al revés)
```

Si `apply` contesta «No changes», preprod ya estaba vivo: se destruye y se vuelve a crear.

## Qué sale de dónde

| Dato | De dónde sale |
|---|---|
| La cadena de conexión de la api | se **arma** en `local.conn` con el host del proyecto, la base, el rol y la contraseña que generó Neon |
| El `BACKEND_URL` del front | el atributo `url` del servicio de la api |
| La imagen que corre | `image_repo_*` + `image_tag` en `variables.tf` (la de `v7.0.0`) |
| Las credenciales | las variables de entorno de la terminal; nunca el HCL |
| El estado | `terraform.tfstate`, en esta carpeta, **ignorado por git**: tiene contraseñas en texto plano |

Render no deja **modificar** un servicio del plan gratuito con este provider (`maintenance mode can
only be configured for non-free tier services`). Para cambiar la imagen de preprod: cambiar
`image_tag` por PR y recrear (`terraform apply -replace=render_web_service.api` y lo mismo con el front).
