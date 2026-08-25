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
