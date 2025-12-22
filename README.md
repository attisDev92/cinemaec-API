# CinemaEC Backend

Backend de la aplicación CinemaEC desarrollado con NestJS.

## Configuración Base

El proyecto está configurado con:

- ✅ **PostgreSQL** - Base de datos configurada con TypeORM
- ✅ **CORS** - Habilitado para comunicación con frontend
- ✅ **Swagger** - Documentación de API disponible en `/api`
- ✅ **Variables de entorno** - Gestión con ConfigModule

## Variables de Entorno

Crear archivo `.env` en la raíz con:

```env
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:3001

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=
DB_NAME=cinemaec
```

## Instalación

```bash
npm install
```

## Ejecutar la aplicación

```bash
# Desarrollo
npm run start:dev

# Producción
npm run start:prod
```

## Acceso

- API: http://localhost:3000
- Swagger: http://localhost:3000/api
- Health check: http://localhost:3000/health

## Estructura

```
src/
  ├── config/         # Configuración de variables de entorno
  ├── app.module.ts   # Módulo principal con TypeORM y ConfigModule
  ├── main.ts         # Bootstrap con CORS y Swagger
  └── ...
```

## Próximos pasos

El proyecto está listo para agregar módulos y entidades según sea necesario.
