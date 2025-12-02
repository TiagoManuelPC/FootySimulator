# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# copy csproj and restore as distinct layers
COPY ["API.csproj", "./"]
RUN dotnet restore "./API.csproj"

# copy everything else and publish
COPY . ./
RUN dotnet publish "API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish ./

# Use PORT env var if provided by the platform; otherwise default to 5001
ENV ASPNETCORE_URLS="http://+:${PORT:-5001}"

ENTRYPOINT ["dotnet", "API.dll"]
