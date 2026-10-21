# ---- Etapa 1: build (imagen con el SDK completo de .NET 8) ----
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Primero los archivos de proyecto, después el código: la capa del restore solo se
# rehace si cambian los .csproj, no en cada cambio de código (cache de capas).
COPY Turnos.sln .
COPY Turnos.Api/Turnos.Api.csproj Turnos.Api/
COPY Turnos.Api.Tests/Turnos.Api.Tests.csproj Turnos.Api.Tests/
RUN dotnet restore Turnos.sln

COPY . .
RUN dotnet publish Turnos.Api/Turnos.Api.csproj -c Release -o /app/publish --no-restore

# ---- Etapa 2: tests (parte del build: ya tiene el SDK, el código y los paquetes) ----
# No lleva WORKDIR: hereda /src de la etapa build, que es donde está la solución.
# Corre en el `docker run` del pipeline, no en el `docker build`: así los resultados
# salen por el volumen montado en /out. La imagen final no se lleva nada de esto.
#   CollectCoverage + Threshold + ThresholdType: el umbral que rompe el build (90 en
#     línea y rama; %2c es la coma, MSBuild parte los valores por coma).
#   Exclude: qué NO entra en la cuenta. Es la misma lista que el -classfilters del
#     reporte en ci.yml: el arranque, lo generado por EF y las clases que sólo tienen datos.
FROM build AS test
ENTRYPOINT ["dotnet", "test", "Turnos.sln", \
            "/p:CollectCoverage=true", "/p:Threshold=90", "/p:ThresholdType=line%2cbranch", \
            "/p:Exclude=[Turnos.Api]Program*%2c[Turnos.Api]Turnos.Api.Migrations.*%2c[Turnos.Api]Turnos.Api.Data.*%2c[Turnos.Api]Turnos.Api.Models.*%2c[Turnos.Api]Turnos.Api.Options.*", \
            "--logger", "trx;LogFileName=tests.trx", \
            "--results-directory", "/out"]

# ---- Etapa 3: runtime (solo ASP.NET, sin SDK ni compilador) ----
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
LABEL org.opencontainers.image.source=https://github.com/santiago6124/ingsoft3-turnos
WORKDIR /app
COPY --from=build /app/publish .
# El commit del que salió esta imagen (lo pasa el pipeline como build arg). /health lo devuelve:
# es la forma de comprobar desde afuera que un entorno corre ESTA imagen (TP7). Va abajo de todo,
# para que un commit nuevo no invalide el cache de las capas pesadas.
ARG GIT_COMMIT
ENV GIT_COMMIT=${GIT_COMMIT}
# La imagen aspnet:8.0 escucha en 8080 por defecto.
EXPOSE 8080
ENTRYPOINT ["dotnet", "Turnos.Api.dll"]
