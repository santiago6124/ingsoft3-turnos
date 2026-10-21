# ---- Etapa 1: build del bundle con Node ----
FROM node:20-alpine AS build
WORKDIR /app
# package.json + lockfile primero: la capa de npm ci se reutiliza si no cambian.
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
# El commit con el que se construyó este bundle, servido en /version.txt (TP6). Lo pasa el
# pipeline (GIT_COMMIT) o Render (RENDER_GIT_COMMIT, que entrega como build arg). El smoke test
# lo compara con el commit verificado: así detecta un front que quedó viejo aunque el deploy
# figure como live con el commit nuevo, que ya nos pasó con el cache de build de Render.
# Va DESPUÉS del build a propósito: un commit nuevo no invalida el cache de npm ci ni el del build.
ARG GIT_COMMIT
ARG RENDER_GIT_COMMIT
RUN echo "${GIT_COMMIT:-${RENDER_GIT_COMMIT:-local}}" > dist/version.txt

# ---- Etapa 2: tests (parte del build: ya tiene Node y las dependencias de desarrollo) ----
# Va en el medio a propósito: si quedara última, la imagen por defecto sería la de tests.
# test:ci es la misma receta que corro en mi máquina; el pipeline le pasa COVERAGE_DIR
# para que el reporte caiga en la carpeta montada.
FROM build AS test
ENTRYPOINT ["npm", "run", "test:ci"]

# ---- Etapa 3: nginx sirve los estáticos y proxea /api al backend ----
FROM nginx:alpine AS final
LABEL org.opencontainers.image.source=https://github.com/santiago6124/ingsoft3-turnos
# Va a templates/ y no a conf.d/: nginx leería conf.d/ tal cual, con los ${…} sin reemplazar.
COPY default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
# Los valores de compose, por defecto: el `docker compose up` del TP2 sigue andando sin tocarlo.
# Render los pisa con las variables de cada servicio.
ENV BACKEND_URL=http://backend:8080 \
    DNS_RESOLVER=127.0.0.11
EXPOSE 80
