# Nada de esto es secreto: un identificador de organización, nombres de imágenes públicas, una
# etiqueta y una región. Por eso va con default en un archivo que SÍ se versiona. Lo secreto (las
# API keys) lo leen los providers del entorno, y lo local iría en un *.tfvars ignorado.

variable "neon_org_id" {
  description = "Organización de Neon. Desde 2026 la API la exige para crear proyectos."
  default     = "org-steep-paper-07826118"
}

variable "image_repo_api" {
  description = "Imagen de la api, SIN etiqueta (la etiqueta va aparte, en image_tag)."
  default     = "ghcr.io/santiago6124/ingsoft3-turnos-backend"
}

variable "image_repo_front" {
  description = "Imagen del front, SIN etiqueta."
  default     = "ghcr.io/santiago6124/ingsoft3-turnos-frontend"
}

variable "image_tag" {
  description = "La imagen que corre preprod: la de la release v7.0.0. Fija a propósito; cambiarla es un PR."
  default     = "sha-ec2fd7393cf0aff1e16710e355c2a85d3fbba866"
}

variable "region" {
  description = "Región de Render. Virginia, la misma de AWS que Neon (aws-us-east-1)."
  default     = "virginia"
}
