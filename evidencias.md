# Evidencias

Salidas de terminal capturadas en el momento de cada paso. Cada TP agrega su sección.

> 📸 Las capturas de la interfaz web de GitHub (aviso de conflicto en el PR #3 y página de la
> release) se agregan en `evidencias/img/`; por ahora la evidencia es la salida de `gh`, que
> muestra el mismo estado.

## TP1 — Git colaborativo

### 1. Push directo a `main` rechazado

GitHub rechaza el push porque `main` está protegida y la regla alcanza también al dueño del
repositorio (`enforce_admins: true`, el equivalente de *Do not allow bypassing*):

```
$ git push
remote: error: GH006: Protected branch update failed for refs/heads/main.        
remote: 
remote: - Changes must be made through a pull request.        
To https://github.com/santiago6124/ingsoft3-turnos.git
 ! [remote rejected] main -> main (protected branch hook declined)
error: failed to push some refs to 'https://github.com/santiago6124/ingsoft3-turnos.git'
```

### 2. El PR de la rama B no se puede mergear: conflicto

Después de mergear el PR #2 (`feature/titulo-a`), GitHub marca el PR #3 como `CONFLICTING` /
`DIRTY`:

```
$ gh pr view 3 --json number,title,state,mergeable,mergeStateStatus,baseRefName,headRefName
{"baseRefName":"main","headRefName":"feature/titulo-b","mergeStateStatus":"DIRTY","mergeable":"CONFLICTING","number":3,"state":"OPEN","title":"Renombra el título del README (versión B)"}
```

### 3. Los marcadores del conflicto

Parado en `feature/titulo-b`, `git merge origin/main` se detiene y deja las dos versiones de la
línea 1 entre marcadores. La sección *Instalación*, que ninguna rama tocó, se fusionó sola:

```
$ git merge origin/main
Auto-merging README.md
CONFLICT (content): Merge conflict in README.md
Automatic merge failed; fix conflicts and then commit the result.

$ git status --short
UU README.md

$ cat README.md
<<<<<<< HEAD
# Proyecto IngSoft3 - versión B
=======
# Proyecto IngSoft3 - versión A
>>>>>>> origin/main
IngSoft3 UCC 2026 — Sistema de turnos (.NET 8 + React + PostgreSQL) con pipeline DevOps de punta a punta

## Instalación

```bash
git clone https://github.com/santiago6124/ingsoft3-turnos.git
```
```

### 4. La release `v1.0.0` publicada

```
$ gh release view v1.0.0
title:	v1.0.0
tag:	v1.0.0
draft:	false
prerelease:	false
immutable:	false
author:	santiago6124
created:	2026-08-25T21:18:41Z
published:	2026-08-25T21:18:45Z
url:	https://github.com/santiago6124/ingsoft3-turnos/releases/tag/v1.0.0
--
Primera release del repositorio, que cierra el **TP1 – Git colaborativo**.


$ git tag -n1
v1.0.0          TP1 cerrado: protecciones de main, flujo de PRs y conflicto resuelto

$ git show v1.0.0 --no-patch --format="%H %s"
38b1618bcbd3cdf4afdcc71789f55db629e9ac20 docs: renombra el título del README a versión B (#3)
```

---

## TP2 — Contenedores

### 1. `docker compose up -d` desde cero y el sistema funcionando end-to-end

Los tres servicios arriba (la base `healthy`), la SPA servida por nginx en el 3000, `/api` proxeado
al backend, y dos reglas de negocio rechazando lo que tienen que rechazar:

```
$ docker compose ps
NAME                         IMAGE                      STATUS                       PORTS
ingsoft3-turnos-backend-1    ingsoft3-turnos-backend    Up About an hour             0.0.0.0:8080->8080/tcp, [::]:8080->8080/tcp
ingsoft3-turnos-db-1         postgres:16-alpine         Up About an hour (healthy)   5432/tcp
ingsoft3-turnos-frontend-1   ingsoft3-turnos-frontend   Up About an hour             0.0.0.0:3000->80/tcp, [::]:3000->80/tcp

$ curl -s localhost:8080/health
{"status":"ok"}

$ curl -s -o /dev/null -w "%{http_code} %{content_type}
" localhost:3000/          # la SPA servida por nginx
200 text/html
$ curl -s localhost:3000/api/turnos                      # /api proxeado por nginx al backend
[]

$ curl -s -X POST localhost:3000/api/turnos -H "Content-Type: application/json" -d '{"citizenName":"Ana Pérez","nationalId":"30111222","scheduledAt":"2026-08-27T10:00:00","serviceType":"Pasaporte"}'
{"id":1,"citizenName":"Ana Pérez","nationalId":"30111222","scheduledAt":"2026-08-27T10:00:00","serviceType":"Pasaporte","status":"Pending","createdAt":"2026-08-25T22:50:29.0304181Z"}

$ curl -s -X PUT localhost:3000/api/turnos/1/confirmar
{"id":1,"citizenName":"Ana Pérez","nationalId":"30111222","scheduledAt":"2026-08-27T10:00:00","serviceType":"Pasaporte","status":"Confirmed","createdAt":"2026-08-25T22:50:29.030418Z"}

# Regla 1: otro turno del mismo trámite en el mismo slot ya confirmado → 409
$ curl -s -w " [%{http_code}]" -X POST localhost:3000/api/turnos ... scheduledAt 2026-08-27T10:00:00 Pasaporte
{"error":"That time slot already has a confirmed appointment. Choose another."} [409]
# Regla 4: sábado → 400
$ curl -s -w " [%{http_code}]" -X POST ... scheduledAt 2026-08-29T10:00:00
{"error":"The chosen time doesn't correspond to an available slot."} [400]

$ curl -s localhost:8080/api/turnos | jq -c ".[] | {id,citizenName,scheduledAt,serviceType,status}"
{"id":1,"citizenName":"Ana Pérez","scheduledAt":"2026-08-27T10:00:00","serviceType":"Pasaporte","status":"Confirmed"}
{"id":2,"citizenName":"Juan Gómez","scheduledAt":"2026-08-27T10:15:00","serviceType":"Radicación","status":"Pending"}
```

### 2. Prueba de persistencia

`down` conserva los datos (el volumen sobrevive al contenedor); `down -v` los borra:

```
$ docker compose down && docker compose up -d
 Container ingsoft3-turnos-db-1 Stopped 
 Container ingsoft3-turnos-db-1 Removing 
 Container ingsoft3-turnos-db-1 Removed 
 Network ingsoft3-turnos_default Removed 
 Container ingsoft3-turnos-db-1 Healthy 
 Container ingsoft3-turnos-backend-1 Started 
 Container ingsoft3-turnos-frontend-1 Started 
$ curl -s localhost:8080/health
{"status":"ok"}
$ curl -s localhost:8080/api/turnos | jq -c ".[] | {id,citizenName,status}"     # SIGUEN: el volumen sobrevivió
{"id":1,"citizenName":"Ana Pérez","status":"Confirmed"}
{"id":2,"citizenName":"Juan Gómez","status":"Pending"}

$ docker compose down -v && docker compose up -d
 Volume ingsoft3-turnos_db_data Removed 
 Network ingsoft3-turnos_default Removed 
 Container ingsoft3-turnos-backend-1 Started 
 Container ingsoft3-turnos-frontend-1 Started 
$ curl -s localhost:8080/health
{"status":"ok"}
$ curl -s localhost:8080/api/turnos      # vacío: -v borró también el volumen
[]
```

### 3. Comparación de tamaño: la imagen que COMPILA vs la que EJECUTA

```
$ docker images --format "table {{.Repository}}	{{.Tag}}	{{.Size}}"
REPOSITORY                 TAG         SIZE
ingsoft3-turnos-backend    latest      363MB
ingsoft3-turnos-frontend   latest      93MB
postgres                   16-alpine   411MB
```

El backend final (363 MB) pesa **3,4 veces menos** que el SDK que lo compiló (1,25 GB). El frontend
final (93 MB) no tiene Node: solo nginx y los estáticos, contra los 194 MB de `node:20-alpine`.

El volumen y su driver:

```
$ docker volume ls | grep ingsoft3
local     ingsoft3-turnos_db_data
$ docker volume inspect ingsoft3-turnos_db_data --format "{{.Driver}} {{.Mountpoint}}"
local /var/lib/docker/volumes/ingsoft3-turnos_db_data/_data
```

### 4. Las imágenes publicadas en el registry y el compose que las baja

```
# Estando logueado en ghcr.io, el compose que BAJA las imágenes en vez de construirlas:
$ docker compose down --rmi local && docker rmi ghcr.io/... && docker builder prune -af
 Image ingsoft3-turnos-backend:latest Removed 
 Image ingsoft3-turnos-frontend:latest Removed 
 Network ingsoft3-turnos_default Removed 
Untagged: ghcr.io/santiago6124/turnos-frontend:v0.1.0
Deleted: sha256:d220f0eaec3d12d895e4cf1c10ac00173d59d21cf28d094f60e66ee6e38c56ac
Total:	2.001GB

$ docker compose -f docker-compose.registry.yml up -d      # NO construye: descarga
 c3ee22b57f6b Pull complete 0B
 Image ghcr.io/santiago6124/turnos-frontend:v0.1.0 Pulled 
 Container ingsoft3-turnos-db-1 Started 
 Container ingsoft3-turnos-db-1 Healthy 
 Container ingsoft3-turnos-backend-1 Started 
 Container ingsoft3-turnos-frontend-1 Started 

$ curl -s localhost:8080/health && curl -s -o /dev/null -w "%{http_code}
" localhost:3000/
{"status":"ok"}
200

# Prueba de visibilidad: sin credenciales todavía NO se puede bajar (los packages de ghcr nacen privados)
$ docker logout ghcr.io && docker rmi ... && docker pull ghcr.io/santiago6124/turnos-backend:v0.1.0
 Network ingsoft3-turnos_default Removed 
Removing login credentials for ghcr.io
Deleted: sha256:cc777ec09e4763d378623804b4d5a286308d8f518804f480b853e9e39d251e65
Error response from daemon: error from registry: unauthorized
unauthorized
```

> ⚠️ El último `pull` **falla a propósito** en esta captura: los packages de ghcr nacen **privados** y
> el cambio de visibilidad no se puede hacer por API (`PATCH /user/packages/container/{name}` devuelve
> 404). Queda como evidencia de por qué el paso manual en *Package settings → Change visibility* es
> necesario; una vez hecho, el mismo `docker pull` sin credenciales funciona.
