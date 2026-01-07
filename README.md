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

## Despliegue

- [docs/RENDER_DEPLOYMENT.md](docs/RENDER_DEPLOYMENT.md) - Guía completa de despliegue en Render.com
- [docs/RENDER_ENV_SETUP.md](docs/RENDER_ENV_SETUP.md) - Configuración de variables de entorno para Render

## Documentación

- [docs/EMAIL_SETUP.md](docs/EMAIL_SETUP.md) - Configuración de correo y credenciales.
- [docs/FIREBASE_SETUP.md](docs/FIREBASE_SETUP.md) - Setup inicial de Firebase.
- [docs/FIREBASE_CREDENTIALS_SETUP.md](docs/FIREBASE_CREDENTIALS_SETUP.md) - Carga de credenciales de Firebase.
- [docs/FIREBASE_PRODUCTION_SETUP.md](docs/FIREBASE_PRODUCTION_SETUP.md) - Configuración de Firebase para producción.
- [docs/FRONTEND_LOGIN_GUIDE.md](docs/FRONTEND_LOGIN_GUIDE.md) - Guía de login para frontend.
- [docs/FRONTEND_SPACE_REVIEW.md](docs/FRONTEND_SPACE_REVIEW.md) - Flujo de reseñas de espacios en frontend.
- [docs/FRONTEND_TYPES.md](docs/FRONTEND_TYPES.md) - Contratos y tipos compartidos para frontend.
- [docs/MIGRATION_CAMELCASE.md](docs/MIGRATION_CAMELCASE.md) - Convención camelCase en migraciones.
- [docs/USERS_ROLES_PERMISSIONS.md](docs/USERS_ROLES_PERMISSIONS.md) - Roles y permisos de usuarios.

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
