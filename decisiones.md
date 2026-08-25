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
