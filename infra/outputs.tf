# Lo que no es secreto. La contraseña del rol NO sale por output: se imprimiría en la consola y en
# cualquier log. La cadena de conexión se arma adentro (main.tf, local.conn) y viaja directo al servicio.

output "db_host" {
  value = neon_project.preprod.database_host
}

output "database" {
  value = neon_database.preprod.name
}

output "api_url" {
  value = render_web_service.api.url
}

output "front_url" {
  value = render_web_service.front.url
}
