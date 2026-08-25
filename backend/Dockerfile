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

# ---- Etapa 2: runtime (solo ASP.NET, sin SDK ni compilador) ----
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
LABEL org.opencontainers.image.source=https://github.com/santiago6124/ingsoft3-turnos
WORKDIR /app
COPY --from=build /app/publish .
# La imagen aspnet:8.0 escucha en 8080 por defecto.
EXPOSE 8080
ENTRYPOINT ["dotnet", "Turnos.Api.dll"]
