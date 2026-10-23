# Spec — TP9: DevSecOps y observabilidad

> Escrita antes de tocar código. El cómo está en [`plan.md`](plan.md) y el orden en
> [`tasks.md`](tasks.md). Enunciado: `TPs_2026/trabajos/09-devsecops-observabilidad.md`.

## Problema

La app se construye, se prueba y se entrega sola, pero nadie la mira una vez que está en PROD:

- **Dependencias**: el back usa EF Core, Npgsql y Swashbuckle, y el front React, Vite y vitest. Nadie
  se entera cuando sale una versión con un arreglo de seguridad. Las actions del pipeline (`docker/*`,
  `actions/*`) también son código de terceros que corre con mis permisos.
- **Código propio**: los tests prueban lo que se me ocurrió probar. Nada lee el código buscando lo
  que no se me ocurrió.
- **Secretos**: el repo es público y el semestre ya pasó por claves de Neon, Render y hooks de deploy.
  Hoy no se filtró ninguna porque tuve cuidado, y eso no es un control.
- **Caídas**: si PROD se cae un sábado, me entero cuando alguien me lo dice. Además, hoy
  `HEAD /health` en PROD contesta **405** (`allow: GET`, medido el 23/10). Un monitor gratuito pregunta
  con HEAD, así que marcaría caída con la app viva.
- **Comportamiento**: `/health` dice que la app vive, pero no qué falla, qué tarda ni qué se usa.

## Requisitos

### R1 · Dependencias vigiladas (Tarea 1)
- `.github/dependabot.yml` con tres ecosistemas: `nuget` en `/backend` (ahí está `Turnos.sln`), `npm`
  en `/frontend` y `github-actions` en `/`. Semanal.
- *Dependabot alerts* y *Dependabot security updates* prendidos.
- **Un PR de Dependabot mergeado** después de leerlo: qué sube, de qué versión a cuál, si el salto es
  patch, minor o major, qué dice el changelog, y la cadena completa en verde. Llega a PROD por el gate,
  como cualquier cambio de la app.

### R2 · CodeQL (Tarea 2)
- *Default setup* (C#, JS/TS y Actions), con su primer análisis terminado en *Security → Code scanning*.
- Práctica: analizar al menos dos hallazgos, reales o provocados en una rama que no se mergea, con su
  categoría OWASP y la decisión tomada.

### R3 · Push protection (Tarea 3)
- Verificar que está activa (ya lo está desde que el repo es público).
- Práctica: intentar pushear un PAT real sin scopes y ver el bloqueo. Después, borrar la rama y
  revocar el PAT.

### R4 · PROD observada desde afuera (Tarea 4)
- `/health` acepta **GET y HEAD**, y llega a PROD por el pipeline **antes** de crear el monitor.
- Monitor HTTP de UptimeRobot sobre `https://turnos-api-prod-rowo.onrender.com/health`, cada 5 min,
  con alerta por mail. **Sólo PROD.**
- Caída provocada: *Suspend* de la api de PROD → mail de DOWN → *Resume* → mail de UP. Medir cuánto
  tardó cada uno.
- **El monitor queda pausado** al terminar. Cada 5 min mantiene PROD despierta y se come las 750 h
  compartidas de Render.

### R5 · La app observada desde adentro (Tarea 5)
- **Back**: `Sentry.AspNetCore`, con el DSN leído de `SENTRY_DSN`. La variable existe **sólo en la api de
  PROD**. Sin ella, en local, en los tests y en QA, la librería queda apagada. Como `release` va el commit
  que ya devuelve `/health`, para que cada error diga qué versión lo produjo.
- **Front**: `@sentry/react` en `main.tsx`, con el DSN escrito en el código (sirve para enviar, no para
  leer) y `environment = hostname` para separar QA, PROD y localhost.
- Un endpoint de error **temporal** (`GET /api/falla`) que sube con Sentry y se saca antes de cerrar.
- Usar PROD unos minutos y ver en Sentry un error, la operación más lenta (P95) y la más usada (TPM).
- Una **tarjeta en el tablero** «IngSoft3 - Turnos DevOps», con el número adentro.

### R6 · Release (Tarea 6)
- `v9.0.0` sobre el commit que está en `production`, ya sin `/api/falla`.

## Fuera de alcance
- Sentry en QA para el back. Las corridas de integración y e2e meterían su tráfico sintético en la
  medición de uso real.
- Alertas de Sentry por mail, y cualquier cosa paga (HEAD en el monitor, más frecuencia).

## Criterios de aceptación

| # | Comprobación |
|---|---|
| A1 | `curl -I` al `/health` de PROD → 200 |
| A2 | *Settings → Advanced Security*: alertas y security updates de Dependabot, CodeQL y push protection, prendidos |
| A3 | Un PR de Dependabot mergeado con la cadena en verde, y su imagen en PROD |
| A4 | *Code scanning* con el primer análisis de CodeQL terminado |
| A5 | Historial del monitor: un DOWN y un UP provocados, y el monitor en *Paused* |
| A6 | Sentry: un issue de `/api/falla` con `release` = commit de PROD; tabla de transacciones con P95 y TPM |
| A7 | Tarjeta en el tablero con el dato y el número |
| A8 | `/api/falla` ya no existe en PROD (404); `v9.0.0` = commit de `production` |
| A9 | `decisiones.md` › TP9: el PR de Dependabot, el tiempo de detección, la operación más usada y la más lenta, los problemas y la IA |
