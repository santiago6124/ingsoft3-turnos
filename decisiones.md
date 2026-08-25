# Decisiones

Registro de decisiones del semestre. Cada TP agrega su sección abajo de la anterior.

## TP1 — Git colaborativo

### 1. Por qué Git no pudo resolver el conflicto solo

Las ramas `feature/titulo-a` y `feature/titulo-b` nacieron del **mismo commit** de `main`
(`6061db4`, el que ya tenía la sección *Instalación* del PR #1), y las dos cambiaron **la misma
línea** del `README.md` —la primera, el título— con textos distintos:

| | Línea 1 del `README.md` |
|---|---|
| Ancestro común (`6061db4`) | `# ingsoft3-turnos` |
| `main` después de mergear A (`d965633`) | `# Proyecto IngSoft3 - versión A` |
| `feature/titulo-b` | `# Proyecto IngSoft3 - versión B` |

Cuando el PR #2 (versión A) entró a `main`, GitHub marcó el PR #3 como `CONFLICTING`. Al hacer
`git merge origin/main` parado en `feature/titulo-b`, Git hizo un merge de tres vías: comparó cada
punta contra el ancestro común. Las dos habían modificado la misma línea respecto del ancestro, y de
forma distinta. Git compara texto, no entiende qué significa; no hay ninguna regla mecánica que le
permita decidir si el título correcto es "versión A" o "versión B", porque esa respuesta no está en
los archivos: está en la cabeza del equipo. Por eso dejó las dos versiones entre marcadores
(`<<<<<<< HEAD`, `=======`, `>>>>>>> origin/main`) y devolvió la decisión a una persona.

La prueba de que el criterio es "misma línea" y no "mismo archivo" está en la evidencia 3: la
sección `## Instalación`, en el mismo archivo, **se fusionó sola**, porque ninguna de las dos ramas la
tocó.

**Qué habría tenido que pasar para que nunca apareciera:**

1. **Integrar antes.** Si `feature/titulo-b` se hubiera creado *después* de mergear la A (o hubiera
   hecho `git pull` de `main` antes de tocar el título), habría partido de un `main` que ya decía
   "versión A" y su cambio habría sido secuencial, no paralelo. Es la razón por la que se insiste con
   ramas cortas e integración frecuente: los conflictos no desaparecen, pero quedan chicos.
2. **Que las dos ramas no tocaran la misma línea.** Si el trabajo se reparte por zona del archivo,
   Git fusiona sin preguntar.
3. **Decidir antes de escribir.** El conflicto es el síntoma; la causa es que dos "personas" tomaron
   la misma decisión (cómo se llama el proyecto) por separado.

### 2. Problemas encontrados y cómo se resolvieron

- **Los primeros PRs no se crearon.** El primer intento usó `gh pr create --json number`, y ese
  flag no existe para `pr create` (sí para `pr view`/`pr list`). El comando falló, pero el error
  quedó tapado por el `|| gh pr list ...` de respaldo, así que las tres ramas se pushearon sin PR y
  los merges siguientes no encontraron nada que mergear. Se detectó porque `main` seguía en el commit
  del `.gitignore`. Solución: se borraron las ramas A y B (locales y remotas), se creó el PR #1 con
  `gh pr create --head feature/seccion-instalacion` sobre la rama ya subida, se mergeó, y recién
  después se volvieron a crear A y B **desde el `main` actualizado** — que además deja el ejercicio
  más limpio: el ancestro común de las dos ya incluye la sección de instalación.
- **`mergeable: UNKNOWN` justo después de mergear A.** GitHub recalcula el estado de los otros PRs de
  forma asíncrona; el primer `gh pr view` puede devolver `UNKNOWN`. Se resolvió consultando en un
  bucle hasta que devolvió `CONFLICTING`. Es el mismo "esperá unos segundos" que la guía menciona para
  la web.
- **El conflicto se resolvió por consola, no desde la web.** La guía lo hace con *Resolve conflicts*
  en GitHub; acá se hizo con `git merge origin/main` en la rama B, editando el archivo y commiteando
  la resolución (`fix: resuelve conflicto de título tomando la versión B`). Los marcadores son los
  mismos; cambia el nombre que aparece al lado: `HEAD` es la rama en la que uno está parado.
- **El tag `v1.0.0` se creó antes de que existieran estos dos archivos.** Se siguió el orden de la
  guía (§4.7 tag y release, §4.8 los archivos), y eso deja al tag apuntando a un commit sin la
  entrega. Como el reglamento (§3) indica, se movió el tag al commit que sí la incluye con
  `git tag -f v1.0.0 && git push -f origin v1.0.0`, y queda registrado acá. La release `v1.0.0`
  sigue asociada al tag, por lo que pasa a mostrar el commit nuevo.
- **La máquina no tenía Docker ni .NET.** Como la app del semestre es .NET 8 y desde la clase 2 hace
  falta Docker, se instalaron `dotnet@8` (Homebrew) y Docker vía `colima` + `docker` CLI +
  plugins `compose` y `buildx`, en lugar de Docker Desktop. Es funcionalmente equivalente para todo
  lo que pide la materia (`docker compose`, `docker build`, registry) y no necesita interfaz gráfica.

### 3. Declaración de uso de IA

**Todo el TP1 fue ejecutado con asistencia de IA**: se usó Claude Code (modelo Claude Fable 5)
operando `git` y `gh` desde la terminal bajo mi indicación, incluyendo la creación del repositorio,
la protección de `main` vía API (`enforce_admins: true`, 0 aprobaciones), los tres PRs, la fabricación
y resolución del conflicto, el tag, la release, y la redacción de este archivo y de `evidencias.md`.

Cómo se verificó lo que la IA hizo:
- Cada paso dejó salida de terminal que se revisó (el rechazo `GH006`, el JSON del PR #3 con
  `mergeable: CONFLICTING`, el `README.md` con los marcadores, el `git log` final).
- El estado se contrastó contra GitHub: *Settings → Branches* muestra la regla sobre `main`; los PRs
  #1, #2 y #3 figuran mergeados con squash; el tag y la release aparecen en *Releases*.
- El error del `--json` en `gh pr create` lo cometió la IA y también lo detectó ella al ver que
  `main` no avanzaba; queda documentado arriba porque es parte del proceso real.

Lo que se defiende en P1 no es el procedimiento sino su comprensión: qué protege la regla de
`main`, por qué el autor no puede aprobar su propio PR, qué es una rama para Git, por qué el merge
de tres vías se detuvo, y qué significa `v1.0.0` en semver.

---

## TP2 — Contenedores: la app del semestre

### 1. Qué app elegí y por qué

**Sistema de turnos** (trámites de la Dirección Nacional de Migraciones), adaptada de
[`valselviz/turnos-system`](https://github.com/valselviz/turnos-system): ASP.NET Core 8 + React 18/Vite +
PostgreSQL 16. Contra los cinco criterios de [`elegir-app.md`](https://github.com/ingsoft3ucc/TPs_2026/blob/main/elegir-app.md):

1. **Corre hoy.** Se clonó y se levantó completa antes de comprometerse. Requirió instalar el SDK de
   .NET 8 y Docker (ver más abajo), no tocar el código para que arrancara.
2. **Sé con qué se compila.** `dotnet publish` para el back y `npm run build` (Vite) para el front —
   que es exactamente lo que hay que escribir en un Dockerfile.
3. **La conexión a la base es parametrizable por variable de entorno sin tocar código.** Está en
   `backend/Turnos.Api/appsettings.json` bajo `ConnectionStrings:AppointmentsDb`, y .NET la pisa con
   `ConnectionStrings__AppointmentsDb` (el doble guión bajo anida claves). Es el criterio que más
   pesa: en este TP la misma app apunta a `localhost` en desarrollo y a `db` dentro de compose, y en
   el TP6 va a apuntar a la base de QA y a la de PROD **sin recompilar la imagen**.
4. **Tiene reglas de negocio de verdad, no solo ABM.** Cuatro, documentadas en el README: turno único
   confirmado por slot+trámite, cancelación solo desde pendiente/confirmado, fecha futura obligatoria,
   y slots válidos (L-V, 09:00–16:00, cada 15 min, configurables). Alcanzan de sobra para los 8 tests
   de backend del TP5 — de hecho el repo ya trae **18 tests xUnit** que pasan. En el frontend hay
   validación de formulario y cálculo de slots disponibles para los 4 tests que pide el TP5.
5. **La entiendo lo suficiente para modificarla.** En este mismo TP se le cambiaron las rutas de los
   controllers, se le agregó el endpoint `/health` y se cambió el modo en que el front resuelve la URL
   de la API (ver abajo).

**Tamaño**: chica a propósito — una entidad (`Appointment`), dos controllers, dos vistas. La guía
recomienda dos o tres pantallas: más grande solo significa builds más lentos y más puntos de falla.

**Qué le cambié al repo original** (y por qué, porque esto se defiende):

- **Rutas bajo `/api`**: los controllers eran `[Route("turnos")]` y `[Route("available-slots")]`.
  Pasaron a `api/turnos` y `api/available-slots` para que nginx pueda proxear un único prefijo `/api`
  al backend. Sin esto habría que listar cada ruta en el `nginx.conf`.
- **El frontend ahora usa una ruta relativa.** `src/api.ts` tenía
  `VITE_API_URL || 'http://localhost:5080'`: una URL absoluta horneada en el bundle, que obliga a
  reconstruir la imagen para cambiar de entorno y además genera CORS. Ahora el default es `/api`, que
  en desarrollo resuelve el proxy de Vite (`vite.config.ts`) y en el contenedor resuelve nginx. La
  imagen del front pasa a ser la misma para cualquier entorno — que es el punto del TP7.
- **Endpoint `/health`** en `Program.cs`: lo usan el healthcheck, el pipeline del TP4 y el monitoreo
  del TP9.
- **Swagger siempre activo**, no solo en `Development`: el compose original forzaba
  `ASPNETCORE_ENVIRONMENT=Development` solo para no perder Swagger, lo que también activa páginas de
  error con stack traces. Se prefirió dejar el entorno en su default (`Production`) y exponer Swagger
  explícitamente.
- **Se agregó `backend/Turnos.sln`**: la solución no estaba versionada, y el Dockerfile la necesita
  para copiar los `.csproj` antes del `restore` (la capa cacheable).
- **Se descartaron los Dockerfiles y el compose del repo original**, que existían pero no cumplían el
  contrato del TP: las credenciales de la base estaban escritas en el `docker-compose.yml`, no había
  `.env`/`.env.example`, no había `docker-compose.registry.yml` y el `nginx.conf` no proxeaba `/api`.

### 2. Decisiones de contenerización

**Imágenes base y multi-stage.** Los dos Dockerfiles tienen dos etapas, y la razón es la misma en
ambos: **lo que hace falta para construir no hace falta para ejecutar**.

| | Etapa de build | Etapa final | Tamaño |
|---|---|---|---|
| Backend | `mcr.microsoft.com/dotnet/sdk:8.0` (**1.25 GB**) | `mcr.microsoft.com/dotnet/aspnet:8.0` | **363 MB** |
| Frontend | `node:20-alpine` (**194 MB**) | `nginx:alpine` | **93 MB** |

El backend final pesa **3,4 veces menos** que la imagen que lo compiló: la final no lleva el
compilador, ni el SDK, ni el código fuente, ni los paquetes de NuGet — solo el `publish` y el runtime.
En el frontend la diferencia es aún más marcada en naturaleza: la imagen final **no tiene Node**, solo
nginx y un puñado de archivos estáticos. Menos superficie es menos peso y también menos vulnerabilidades
(lo vamos a medir en el TP9).

**El orden de las instrucciones no es estético, es el cache.** En los dos Dockerfiles se copian primero
los archivos de dependencias (`*.csproj` + `.sln`, `package*.json`) y se corre el `restore`/`npm ci`
**antes** de copiar el código. Así la capa de dependencias solo se rehace cuando cambian esos archivos:
un cambio de código no vuelve a bajar todos los paquetes. Es la misma propiedad que el TP4 explota en el
pipeline con `cache-from`/`cache-to`.

**`npm ci` y no `npm install`**: `ci` respeta el `package-lock.json` al pie de la letra y falla si está
desincronizado; `install` puede resolver versiones distintas y hacer que la imagen no sea reproducible.

**Dos `.dockerignore`, no uno.** Docker busca el archivo en la carpeta que se le pasa como contexto, y
acá hay dos contextos (`./backend` y `./frontend`). El del backend usa `**/bin/` y `**/obj/` con
asteriscos porque los artefactos están dentro de cada proyecto (`Turnos.Api/obj`), no en la raíz del
contexto; sin eso, el `COPY . .` mete el `obj/project.assets.json` generado en mi Mac —con rutas
absolutas mías— y pisa el que acaba de generar el `restore` de Linux. El del frontend excluye
`node_modules/` por una razón análoga: los binarios de Vite/esbuild son por plataforma, y copiar los de
macOS encima de los que instaló `npm ci` para Linux rompe el build.

**Qué persiste y qué no.** Solo la base de datos, en el volumen nombrado `db_data` montado en
`/var/lib/postgresql/data`. Los contenedores de backend y frontend son **descartables**: no guardan
estado, se pueden borrar y recrear sin perder nada. Por eso `docker compose down` conserva los datos
(borra contenedores, no volúmenes) y `docker compose down -v` los borra. Se eligió volumen nombrado y
no bind mount porque en macOS el directorio de datos de PostgreSQL sobre una carpeta del host pasa por
la VM de Docker: es más lento y trae problemas de permisos.

**`depends_on` con `condition: service_healthy`, no `depends_on` a secas.** `depends_on` solo garantiza
que el contenedor de la base **arrancó**, no que PostgreSQL esté aceptando conexiones — y el backend
aplica migraciones de EF Core en el arranque, así que si sale primero se muere con
`Failed to connect`. El `healthcheck` con `pg_isready` es lo que convierte "arrancó" en "está listo".

**El secreto por variable de entorno.** La contraseña de la base está en `.env` (ignorado por git) y el
repositorio solo lleva `.env.example`. Por eso el arranque documentado en el README son **dos** comandos
y no uno: `cp .env.example .env` y después `docker compose up -d`. En el TP4 esa variable pasa a ser un
secreto del repositorio, y en el TP6 una del entorno.

**El `nginx.conf` con el upstream en una variable.** `set $backend_api http://backend:8080;` +
`proxy_pass $backend_api;` en vez de escribir el nombre directo. Con el nombre directo, nginx resuelve el
DNS **al arrancar**, y si el contenedor `backend` todavía no existe se niega a levantar con
`host not found in upstream`. Con variable resuelve recién cuando llega un pedido, así que el frontend
puede arrancar solo. El `proxy_pass` va **sin barra final** a propósito: con barra, nginx reescribe el
prefijo y `/api/turnos` llegaría como `/turnos` al backend.

**Registry: ghcr.io.** Se eligió sobre Docker Hub porque la cuenta ya existe (es la del TP1), las
imágenes quedan junto al código, y en el TP7 el pipeline se va a poder autenticar contra ghcr con el
`GITHUB_TOKEN` del propio workflow, sin guardar ningún secreto. Ambas imágenes llevan
`LABEL org.opencontainers.image.source` apuntando a este repositorio para que queden enlazadas.

**⚠️ Arquitectura**: las imágenes `v0.1.0` se construyeron en una Mac con chip Apple, así que son
`linux/arm64`. En una máquina x86 el `pull` falla con `no matching manifest for linux/amd64`, y los
runners de GitHub Actions son x86 — por eso el pipeline del TP4 construye sus propias imágenes en el
runner en vez de bajar éstas. El build multi-arquitectura con `docker buildx` es tema del TP7.

### 3. Problemas encontrados y cómo se resolvieron

- **`global.json` fijaba un SDK que no tengo.** El repo original traía `"version": "8.0.422"`, y el SDK
  instalado por Homebrew es 8.0.130. `dotnet` se niega a hacer nada —ni siquiera `dotnet new`— con un
  mensaje que enumera los SDK instalados. Se bajó el piso a `8.0.100` dejando
  `"rollForward": "latestFeature"`, que acepta cualquier 8.0.x posterior. Mantener el archivo tiene
  sentido: fija la major/minor para que el pipeline y mi máquina compilen con la misma.
- **Heredocs escritos en el directorio equivocado.** Un `cd` dentro de un script hizo que varios
  archivos (`Dockerfile`, `nginx.conf`, `docker-compose.yml`) se intentaran crear con rutas relativas
  desde `backend/`, que no existían. Se detectó por los `no such file or directory` y se rehizo usando
  rutas absolutas. Anecdótico, pero es exactamente el tipo de error que en un pipeline se manifiesta
  como "anda en mi máquina y no en el runner".
- **Los packages de ghcr nacen privados y la API no permite cambiarlo.** `docker push` funciona y el
  package aparece, pero `docker pull` sin credenciales devuelve `unauthorized` (queda registrado en
  `evidencias.md`). El endpoint `PATCH /user/packages/container/{name}` devuelve **404**: GitHub no
  expone el cambio de visibilidad por API, hay que hacerlo desde
  *perfil → Packages → el package → Package settings → Change visibility → Public*. Es el tropiezo
  más común de esta sección y no hay forma de scriptearlo.
- **La máquina no tenía Docker ni .NET** (ver TP1). Se resolvió con `colima` en lugar de Docker
  Desktop: `brew install colima docker docker-compose docker-buildx`, `colima start`. Es un demonio de
  Docker corriendo en una VM Linux, sin interfaz gráfica ni licencia comercial. Todo lo que pide la
  materia (`docker build`, `docker compose`, buildx, registry) funciona igual.

### 4. Declaración de uso de IA

**Todo el TP2 fue ejecutado con asistencia de IA** (Claude Code, modelo Claude Fable 5), bajo mi
indicación: la búsqueda y evaluación de la app contra los cinco criterios, los dos Dockerfiles, los dos
`.dockerignore`, el `nginx.conf`, los dos compose, el `.env.example`, las adaptaciones al código de la
app, el README de arranque y este archivo.

Cómo se verificó:
- **El sistema se levantó de verdad y se probó end-to-end**: `docker compose up -d --build`, la SPA
  responde en el 3000, `/api` proxeado por nginx llega al backend, se creó y confirmó un turno, y se
  comprobaron dos reglas de negocio (409 por slot ocupado, 400 por día no hábil). Todo está en
  `evidencias.md` con la salida real.
- **La prueba de persistencia se corrió completa**: `down` → los datos siguen; `down -v` → la base
  vuelve vacía.
- **El compose del registry se probó de verdad**, borrando antes las imágenes locales y el cache de
  construcción (`--rmi local`, `docker rmi`, `docker builder prune -af`) para que la descarga fuera real
  y no un `Already exists`.
- **Los 18 tests del backend pasan** (`dotnet test`), lo que confirma que las adaptaciones al código no
  rompieron nada.
- Los tamaños de imagen que aparecen arriba salen de `docker images`, no de una estimación.

---

## TP3 — Planificación y trazabilidad

### 1. Duración del sprint y por qué

**Dos semanas.**

El calendario de la materia manda: cada TP está pensado para tomar una semana, y las defensas
agrupan bloques (P1 = TPs 1–4, P2 = TPs 5–9). Un sprint de **una** semana obligaría a cerrar y
replanificar en el mismo día en que se entrega el práctico, y cualquier semana con parcial de otra
materia lo dejaría vacío. Uno de **cuatro** semanas tapa el problema al revés: dos prácticos enteros
adentro del mismo sprint, sin ningún momento de corte para mirar si el ritmo alcanza.

Dos semanas entran exactamente dos TPs, que es la unidad natural de trabajo acá, y dejan un punto de
revisión cada quince días — frecuente para corregir el rumbo, espaciado como para que la ceremonia no
cueste más que el trabajo.

### 2. Límite de trabajo en progreso y por qué

**Dos**, en la columna *In Progress*.

La regla de arranque es *cantidad de personas + 1*, y acá la persona es una sola. El "+1" no es un
permiso para hacer dos cosas a la vez: es la **válvula** para cuando algo queda esperando algo que no
depende de mí — una corrida de CI de varios minutos, una respuesta de la cátedra, un servicio gratuito
que hay que verificar. En vez de mirar la pantalla, muevo una segunda tarjeta.

Con tres o más el límite deja de limitar: se convierte en un backlog paralelo, todo queda empezado y
nada terminado, que es exactamente lo que un límite de trabajo en progreso existe para evitar. La
señal de que quedó **demasiado alto** es no alcanzarlo nunca — si nunca me frena, no está midiendo
nada. La señal de que quedó **demasiado bajo** sería quedarme bloqueado sin nada que hacer con una
tarjeta esperando de verdad.

GitHub no impide pasarse: pone el contador de la columna en rojo. El límite es un **acuerdo visible**,
no un candado — y esa es la diferencia entre un tablero que ordena el trabajo y uno que solo lo
dibuja.

### 3. Diagnóstico de la historia mal escrita

La historia del ejercicio (issue #13) dice: *"Como desarrollador quiero crear la tabla usuarios para
guardar los datos."*

**Por qué está mal**: es una **tarea técnica disfrazada de historia**. El beneficiario es el
desarrollador y no un usuario del sistema, el "para" no expresa ningún valor (*guardar los datos* es
un medio, no un fin: nadie usa el producto para que existan filas en una tabla), y no tiene ningún
criterio de aceptación verificable — "crear la tabla" está hecho o no está hecho, pero no hay forma
de comprobar que el sistema hace algo distinto para alguien. Además fija la **solución** (una tabla)
en vez del problema, con lo cual cierra la puerta a cualquier otra implementación.

**Cómo la reescribiría**: *"Como ciudadano quiero registrarme con mi correo y mi documento para poder
sacar turnos a mi nombre y ver los que ya pedí."* Con criterios comprobables: no se aceptan dos
cuentas con el mismo documento; un correo inválido muestra el error sin enviar el formulario; después
de registrarme veo únicamente mis propios turnos. La tabla pasa a ser lo que siempre fue — una
**tarea** dentro de esa historia, junto con el endpoint y la pantalla.

### 4. Problemas encontrados y cómo se resolvieron

- **El scope `project` de `gh` no se puede obtener sin un navegador.** Los comandos `gh project`
  piden los scopes `project`/`read:project`, que no vienen con la autenticación inicial (la mía
  traía `repo`, `workflow`, `write:packages` y otros, pero no ése). `gh auth refresh -s project`
  arranca un *device flow*: imprime un código de un solo uso y exige abrir
  `github.com/login/device` y confirmar a mano. Es un paso deliberadamente humano.
  **Todo lo que vive en el repositorio se hizo por consola** —las tres etiquetas, la épica, la
  historia, las dos tareas, el bug, la jerarquía de sub-issues y el Pull Request con `Closes`—; el
  **Project** en sí (el tablero, el campo *Sprint*, el límite de trabajo en progreso y la
  visibilidad pública) se configuró después desde la web, que es además como lo muestra el video de
  la cátedra.
- **Los backticks del shell se comieron parte del cuerpo de un issue.** Al crear la tarea #8 con
  `gh issue create --body '... `.github/workflows/ci.yml` ...'`, zsh interpretó el texto entre
  backticks como una **sustitución de comando** y el issue quedó publicado con un hueco donde iba la
  ruta (`Crear  con el disparador…`). Se detectó releyendo el issue con `gh issue view --json body` y
  se corrigió con `gh issue edit --body`. Es la misma clase de error que en un pipeline aparece como
  una variable vacía que nadie nota.
- **La jerarquía se armó con sub-issues, no con task-lists.** Las task-lists (`- [ ] #12` en el
  cuerpo) se ven parecidas pero **no** crean la relación padre-hijo navegable que el TP pide: no se
  puede subir de la tarea a su historia y de ahí a la épica. Se usó
  `gh issue edit <épica> --add-sub-issue <historia>`, disponible desde `gh` 2.94 (acá, 2.97), y se
  verificó por GraphQL que el árbol se recorre en los dos sentidos.
- **El bug va al costado de la jerarquía, no colgando de la historia.** El árbol cuenta lo que se
  planificó construir; un bug es un defecto de algo **ya entregado** — en este caso, del TP2. Si
  colgara de la historia que lo originó, esa historia (ya cerrada) volvería a mostrar trabajo
  pendiente y su barra de progreso mentiría. El matiz que sí reconozco: hay equipos que registran los
  defectos *dentro* del sprint colgados de su historia, no para planificar sino para **medir** cuántos
  se escapan; es una convención de trabajo, no una regla de la herramienta.

### 5. Declaración de uso de IA

**Todo el TP3 fue ejecutado con asistencia de IA** (Claude Code, modelo Claude Fable 5) bajo mi
indicación: la creación de las tres etiquetas, la épica, la historia con sus cuatro criterios de
aceptación, las dos tareas, el bug, el armado de la jerarquía de sub-issues, el Pull Request con
`Closes #8` y la redacción de este archivo.

Cómo se verificó:
- **La jerarquía se comprobó consultándola por GraphQL**, no mirando la pantalla: la épica #6 devuelve
  la historia #7 como sub-issue, y ésta devuelve las tareas #8 y #9.
- **La trazabilidad se comprobó sobre el resultado real**: después de mergear el PR #11, el issue #8
  quedó `CLOSED` con razón `COMPLETED`, y su *timeline* nombra al PR #11 como el que lo cerró. La
  historia #7 y la épica #6 siguen **abiertas**, que es lo que corresponde: el PR implementó una de
  las dos tareas, no la historia entera.
- El error de los backticks lo cometió la IA y quedó documentado arriba, junto con cómo se detectó.

Lo que se defiende en P1 no es haber reproducido el procedimiento: es poder explicar por qué el sprint
dura dos semanas, por qué el límite es dos, por qué cada criterio de aceptación es verificable y por
qué el bug no cuelga de la historia.
