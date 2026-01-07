# Despliegue en Render

Esta guía describe cómo desplegar el backend de CinemaEC en [Render.com](https://render.com).

## Pre-requisitos

1. Cuenta en Render.com (gratuita o de pago)
2. Repositorio de GitHub con el código del backend
3. Base de datos PostgreSQL accesible (Render, GCP Cloud SQL, etc.)
4. Credenciales de Firebase configuradas
5. Credenciales de correo (SMTP)

## Configuración del Proyecto

### 1. Archivos necesarios

El proyecto ya incluye:

- `Dockerfile`: Build multi-stage con Node 18 Alpine
- `.dockerignore`: Excluye archivos innecesarios del build
- `render.yaml`: Configuración Infrastructure as Code (opcional)
- `/health`: Endpoint de healthcheck en `src/app.controller.ts`

### 2. Opciones de despliegue

#### Opción A: Despliegue manual desde el Dashboard

1. **Conectar repositorio:**
   - Ve a [https://dashboard.render.com](https://dashboard.render.com)
   - Clic en "New +" → "Web Service"
   - Conecta tu cuenta de GitHub
   - Selecciona el repositorio `cinemaec-backend`
   - Selecciona la rama `main` (o la que uses para producción)

2. **Configurar servicio:**
   - **Name:** `cinema-ec-backend`
   - **Region:** Oregon (u otra región cercana)
   - **Branch:** `main`
   - **Runtime:** Docker
   - **Plan:** Free (o Starter/Professional según necesidades)

3. **Variables de entorno:**
   Añade las siguientes variables en "Environment" (usa valores reales desde `.env.production`):

   ```
   NODE_ENV=production
   PORT=3000

   # Database
   DB_HOST=<tu-db-host>
   DB_PORT=5432
   DB_USERNAME=<tu-usuario>
   DB_PASSWORD=<tu-password>
   DB_NAME=<tu-base-datos>
   DB_SSL=true

   # JWT
   JWT_SECRET=<tu-jwt-secret>
   JWT_EXPIRES_IN=7d

   # Firebase
   FIREBASE_PROJECT_ID=<tu-project-id>
   FIREBASE_PRIVATE_KEY=<tu-private-key>
   FIREBASE_CLIENT_EMAIL=<tu-client-email>
   FIREBASE_DATABASE_URL=<tu-database-url>

   # Email
   MAIL_HOST=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USER=<tu-email>
   MAIL_PASSWORD=<tu-app-password>
   MAIL_FROM=CinemaEC <noreply@cinemaec.com>

   # CORS
   CORS_ORIGIN=https://tu-frontend.com,https://otro-origen.com
   ```

4. **Healthcheck:**
   - Path: `/health`
   - (Render lo detecta automáticamente del Dockerfile)

5. **Desplegar:**
   - Clic en "Create Web Service"
   - Render buildea la imagen Docker y despliega automáticamente
   - Monitorea logs en tiempo real

#### Opción B: Despliegue con `render.yaml` (Infrastructure as Code)

1. El archivo `render.yaml` ya está configurado en la raíz del proyecto
2. En Render Dashboard:
   - Clic en "New +" → "Blueprint"
   - Conecta tu repositorio
   - Render detecta `render.yaml` automáticamente
   - Configura variables de entorno con `sync: false` en el Dashboard (valores sensibles)
3. Render despliega basado en la configuración del YAML

### 3. Configuración de Base de Datos

#### Si usas Render PostgreSQL:

1. Crear base de datos en Render:
   - Dashboard → "New +" → "PostgreSQL"
   - Name: `cinema-ec-db`
   - Plan: Free (máx 1GB) o de pago
   - Copia las credenciales generadas

2. Whitelist de IPs:
   - Render proporciona IPs públicas del servicio
   - Si usas DB externa (GCP, AWS, etc.), whitelist esas IPs

#### Si usas GCP Cloud SQL u otra DB externa:

1. Asegúrate de que `DB_SSL=true` esté configurado
2. Whitelist las IPs de Render en tu firewall de DB
3. Verifica conectividad con el script de prueba:
   ```bash
   npm run db:check:prod
   ```

### 4. Configuración de CORS

Actualiza `CORS_ORIGIN` con la URL de tu frontend desplegado:

```
CORS_ORIGIN=https://cinemaec.vercel.app,https://cinemaec.com
```

Si necesitas múltiples orígenes, sepáralos por comas.

### 5. Migraciones de Base de Datos

Las migraciones se ejecutan automáticamente en producción gracias a `migrationsRun: true` en `database.config.ts`.

Si necesitas correr migraciones manualmente:

1. Conéctate via Shell en Render Dashboard
2. Ejecuta:
   ```bash
   npm run migration:run
   ```

## Verificación Post-Despliegue

1. **URL del servicio:**
   - Render proporciona una URL automática: `https://cinema-ec-backend.onrender.com`
   - También puedes usar un dominio custom

2. **Healthcheck:**

   ```bash
   curl https://cinema-ec-backend.onrender.com/health
   # Respuesta esperada: OK
   ```

3. **Swagger API:**

   ```
   https://cinema-ec-backend.onrender.com/api
   ```

4. **Logs:**
   - Dashboard → Tu servicio → "Logs"
   - Monitorea errores de inicio o runtime

## Troubleshooting

### Error: "Application failed to respond"

- Verifica que `PORT` sea `3000` (o el que use Render internamente)
- Revisa logs para errores de build o runtime
- Confirma que el healthcheck path `/health` esté correcto

### Error: "Database connection timeout"

- Verifica que `DB_SSL=true` esté configurado
- Confirma las credenciales de DB
- Whitelist las IPs de Render en tu firewall de DB
- Ejecuta el script de prueba:
  ```bash
  ENV_FILE=.env.production DB_SSL=true node scripts/check-db.js
  ```

### Error: "Module not found" o build failure

- Asegúrate de que `package.json` esté actualizado
- Verifica que `Dockerfile` copie todos los archivos necesarios
- Revisa logs de build en Render

### Lentitud o Cold Starts (Free Plan)

- El plan gratuito de Render suspende servicios inactivos después de 15 min
- El primer request después de inactividad puede tardar ~30s (cold start)
- Considera upgrading a plan de pago para instancias always-on

## Comandos Útiles

```bash
# Verificar conexión a DB de producción
ENV_FILE=.env.production DB_SSL=true npm run db:check:prod

# Build local del Dockerfile
docker build -t cinema-ec-backend:latest .

# Run local con env de producción
docker run -p 3000:3000 --env-file .env.production cinema-ec-backend:latest

# Ejecutar migraciones manualmente
npm run migration:run
```

## Auto-Deploy

Render auto-despliega cuando haces push a la rama configurada (ej: `main`). Para deployments manuales:

1. Dashboard → Tu servicio → "Manual Deploy" → "Deploy latest commit"

## Rollback

Si algo falla:

1. Dashboard → Tu servicio → "Events"
2. Selecciona un deploy anterior exitoso
3. Clic en "Rollback to this version"

## Escalamiento

### Plan Free:

- 512 MB RAM
- CPU compartida
- Suspende después de inactividad
- Solo una instancia

### Plan Starter ($7/mes):

- 512 MB RAM
- Always-on
- Auto-scaling opcional

### Plan Professional ($25/mes+):

- Hasta 16 GB RAM
- Auto-scaling horizontal
- Better CPU allocation

## Recursos Adicionales

- [Render Docs](https://render.com/docs)
- [Render Blueprint Spec](https://render.com/docs/blueprint-spec)
- [Render Environment Variables](https://render.com/docs/environment-variables)
- [Render Logs](https://render.com/docs/logs)

---

**Última actualización:** Enero 2026
