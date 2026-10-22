# preprod: un entorno entero, declarado. No existe hasta que esto se aplica, y desaparece con
# `terraform destroy`. QA y PROD (armados a mano en el TP6) NO están acá y no se tocan.
#
# Las credenciales NO están en este archivo: cada provider las lee del entorno.
#   NEON_API_KEY                     → provider "neon"
#   RENDER_API_KEY y RENDER_OWNER_ID → provider "render"

terraform {
  required_version = ">= 1.5"

  required_providers {
    neon = {
      source  = "kislerdm/neon"
      version = "0.18.0" # fijada: el repo del provider está archivado y el oficial va a tener otro nombre
    }
    render = {
      source  = "render-oss/render"
      version = "1.9.1"
    }
  }
}

provider "neon" {}

provider "render" {
  # Que `apply` no termine hasta que los servicios estén live: cuando vuelve, preprod ya contesta.
  wait_for_deploy_completion = true
}

# --- La base de preprod: un proyecto de Neon PROPIO, no una base más en el de la app ---
# Así se puede destruir entero sin rozar app_qa ni app_prod, que viven en el proyecto «Ingedesoft».

resource "neon_project" "preprod" {
  name      = "turnos-preprod"
  org_id    = var.neon_org_id
  region_id = "aws-us-east-1" # Virginia: la misma región que los servicios de Render

  # Sin esto el primer apply falla: el provider pide un día de historial y el plan gratis
  # permite seis horas.
  history_retention_seconds = 21600
}

resource "neon_role" "preprod" {
  project_id = neon_project.preprod.id
  branch_id  = neon_project.preprod.default_branch_id
  name       = "app_preprod_owner"
}

resource "neon_database" "preprod" {
  project_id = neon_project.preprod.id
  branch_id  = neon_project.preprod.default_branch_id
  name       = "app_preprod"
  owner_name = neon_role.preprod.name
}

# --- Los dos servicios de preprod: corren la IMAGEN publicada (la de v7.0.0), no construyen nada ---

locals {
  # La cadena de conexión se ARMA con lo que devolvió Neon: host del proyecto, base, rol y la
  # contraseña que Neon generó. Nadie la copia ni la ve. En el TP6 se pegaba a mano, y el error más
  # caro posible era un entorno apuntando a la base de otro.
  conn = "Host=${neon_project.preprod.database_host};Database=${neon_database.preprod.name};Username=${neon_role.preprod.name};Password=${neon_role.preprod.password};SSL Mode=Require;Channel Binding=Require"
}

resource "render_web_service" "api" {
  name              = "turnos-api-preprod"
  plan              = "free"
  region            = var.region
  health_check_path = "/health" # /health toca la base: si no llega, el deploy no queda live

  runtime_source = {
    image = {
      image_url = var.image_repo_api # SIN la etiqueta: va en su propio campo
      tag       = var.image_tag
    }
  }

  env_vars = {
    ConnectionStrings__AppointmentsDb = { value = local.conn }
    PORT                              = { value = "8080" }
    # NO va GIT_COMMIT: viaja adentro de la imagen y /health lo devuelve. Declararlo acá lo
    # pisaría, y el commit que diga /health dejaría de probar qué imagen corre.
  }
}

resource "render_web_service" "front" {
  name   = "turnos-front-preprod"
  plan   = "free"
  region = var.region

  runtime_source = {
    image = {
      image_url = var.image_repo_front
      tag       = var.image_tag
    }
  }

  env_vars = {
    # La dirección de SU api sale del atributo `url` de ese recurso, no de un copy-paste. Sin barra
    # final: con barra, nginx manda todo a / y cada llamada da 404.
    BACKEND_URL  = { value = trimsuffix(render_web_service.api.url, "/") }
    DNS_RESOLVER = { value = "8.8.8.8" }
    PORT         = { value = "80" }
  }
}

