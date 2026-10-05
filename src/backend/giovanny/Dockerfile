FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY src/VagaLivre.Api/VagaLivre.Api.csproj src/VagaLivre.Api/
RUN dotnet restore src/VagaLivre.Api/VagaLivre.Api.csproj

COPY . .
RUN dotnet publish src/VagaLivre.Api/VagaLivre.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "VagaLivre.Api.dll"]
