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

````
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
````

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

---

## TP4 — CI: Pipelines as Code

> 📌 El enunciado del TP4 **no pide `evidencias.md`**: el repositorio es público y todo esto se ve
> en vivo en la pestaña *Actions* y en los Pull Requests. Se deja acá el resumen con los enlaces
> exactos para no tener que buscarlos durante la defensa.

### Dónde mirar cada cosa

| Qué | Dónde |
|---|---|
| Las corridas del pipeline | [Actions → CI](https://github.com/santiago6124/ingsoft3-turnos/actions/workflows/ci.yml) |
| Los dos jobs en paralelo y el cache | [PR #12](https://github.com/santiago6124/ingsoft3-turnos/pull/12) — dos corridas del mismo PR |
| El gate bloqueando un merge | [PR #14](https://github.com/santiago6124/ingsoft3-turnos/pull/14) — rojo → fix → verde → merge |
| `strict` / *Require branches to be up to date* | [PR #15](https://github.com/santiago6124/ingsoft3-turnos/pull/15) — quedó `BEHIND` al mergear el #14 |
| El badge | arriba de todo en el [README](https://github.com/santiago6124/ingsoft3-turnos#readme) |

### 1. El cache de capas reutilizándose

Primera corrida construyendo de cero; segunda corrida del **mismo PR** (commit vacío, esperando a que
la primera terminara de subir el cache) reutilizando capas:

```
# Corrida 1 — construye todo de cero
  build-frontend: success
  build-backend: success
# Corrida 2 — mismo PR, commit vacío: reutiliza capas
  build-frontend: success
  build-backend: success

$ gh run view 32909339886 --log | grep CACHED
build-frontend Construir la imagen del frontend | #11 CACHED
build-frontend Construir la imagen del frontend | #12 CACHED
build-frontend Construir la imagen del frontend | #13 CACHED
build-frontend Construir la imagen del frontend | #14 CACHED
build-frontend Construir la imagen del frontend | #15 CACHED
build-frontend Construir la imagen del frontend | #16 CACHED
build-frontend Construir la imagen del frontend | #17 CACHED
build-backend Construir la imagen del backend | #9 CACHED
build-backend Construir la imagen del backend | #10 CACHED
build-backend Construir la imagen del backend | #11 CACHED
build-backend Construir la imagen del backend | #12 CACHED
build-backend Construir la imagen del backend | #13 CACHED
build-backend Construir la imagen del backend | #14 CACHED
build-backend Construir la imagen del backend | #15 CACHED
build-backend Construir la imagen del backend | #16 CACHED
build-backend Construir la imagen del backend | #17 CACHED
```

**16 capas reutilizadas**: 9 en el backend y 7 en el frontend. Son las capas caras — las imágenes
base, el `COPY` de los `.csproj`/`package*.json` y el `dotnet restore`/`npm ci` — porque el
Dockerfile del TP2 copia las dependencias antes que el código.

Y el efecto se ve también entre PRs distintos: después de mergear, la corrida de `push` a `main`
dejó el cache en la rama base, así que el PR #14 construyó el frontend en **20 segundos** contra los
39 de la primera corrida de todas.

### 2. El gate actuando: rojo → bloqueado → fix → verde → merge

La secuencia completa sobre el **PR #14**, la rama que rompió el build a propósito
(`using NoExiste;` en `Program.cs`).

#### 2.1 · Rojo: el check falla y el merge queda bloqueado

```
$ gh pr checks 14
build-backend    fail   39s
build-frontend   pass   20s

$ gh pr view 14 --json mergeable,mergeStateStatus
{"mergeStateStatus":"BLOCKED","mergeable":"MERGEABLE"}
```

`mergeable: MERGEABLE` dice que **no hay conflicto de contenido**; el que frena es
`mergeStateStatus: BLOCKED`, o sea el gate. Alcanza con que **uno solo** de los dos checks
requeridos falle, aunque el otro esté en verde.

El error que lo tiró abajo, en el log del job `build-backend`:

```
#15 2.846 /src/Turnos.Api/Program.cs(2,7): error CS0246: The type or namespace name 'NoExiste'
could not be found (are you missing a using directive or an assembly reference?)
[/src/Turnos.Api/Turnos.Api.csproj]
```

Y las condiciones que `main` exige hoy para aceptar un merge:

```
$ gh api ".../branches/main/protection"
{"alcanza_a_admins":true,
 "aprobaciones":0,
 "checks_requeridos":["build-backend","build-frontend"],
 "pull_request_obligatorio":true,
 "rama_actualizada_strict":true}
```

#### 2.2 · Verde: tras el fix, los dos checks pasan y el merge se habilita

```
$ gh pr checks 14
build-backend    pass   14s
build-frontend   pass   12s

$ gh pr view 14 --json mergeable,mergeStateStatus
{"mergeStateStatus":"CLEAN","mergeable":"MERGEABLE"}
```

#### 2.3 · `strict: true` — Require branches to be up to date

Al mergear el #14, `main` avanzó. El PR #15 tenía sus dos checks en verde, pero ese verde se
había sacado contra un `main` que ya no existía:

```
$ gh pr view 15 --json mergeStateStatus,mergeable
{"mergeStateStatus":"BEHIND","mergeable":"MERGEABLE"}
```

`BEHIND` = la rama quedó atrás de `main`. GitHub muestra el botón **Update branch** y no deja
mergear hasta que el pipeline vuelva a correr sobre la **mezcla**. Esto sólo se puede ver con
**dos** Pull Requests abiertos al mismo tiempo — con uno solo, nunca aparece.

Después de apretar *Update branch*, el pipeline corre sobre la mezcla y recién ahí destraba:

```
$ gh pr checks 15
build-backend    pass   18s
build-frontend   pass   16s

$ gh pr view 15 --json mergeStateStatus
{"mergeStateStatus":"CLEAN"}
```
