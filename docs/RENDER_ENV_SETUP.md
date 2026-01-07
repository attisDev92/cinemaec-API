# 🚀 Guía Rápida: Configurar Variables de Entorno en Render

## Paso 1: Preparar tus variables

Usa el archivo [.env.render.example](.env.render.example) como referencia y rellena todos los valores.

## Paso 2: Acceder al Dashboard de Render

1. Ve a https://dashboard.render.com
2. Selecciona tu servicio `cinema-ec-backend`
3. Ve a la pestaña **"Environment"**

## Paso 3: Agregar Variables (una por una)

Haz clic en **"Add Environment Variable"** para cada una de estas:

### ✅ Variables Obligatorias

| Variable                | Ejemplo                                            | Dónde obtenerla                        |
| ----------------------- | -------------------------------------------------- | -------------------------------------- |
| `NODE_ENV`              | `production`                                       | Valor fijo                             |
| `PORT`                  | `3000`                                             | Valor fijo                             |
| `DB_HOST`               | `dpg-xxxxx.oregon-postgres.render.com`             | Render PostgreSQL Dashboard            |
| `DB_PORT`               | `5432`                                             | Valor por defecto PostgreSQL           |
| `DB_USERNAME`           | `cinema_ec_user`                                   | Render PostgreSQL Dashboard            |
| `DB_PASSWORD`           | `tu_password_segura`                               | Render PostgreSQL Dashboard            |
| `DB_NAME`               | `cinema_ec_db`                                     | Render PostgreSQL Dashboard            |
| `DB_SSL`                | `true`                                             | Valor fijo para producción             |
| `JWT_SECRET`            | `tu_secret_aqui_minimo_32_chars`                   | Generar con: `openssl rand -base64 32` |
| `JWT_EXPIRES_IN`        | `7d`                                               | Valor recomendado                      |
| `FIREBASE_PROJECT_ID`   | `cinemaec-12345`                                   | Firebase Console → Settings            |
| `FIREBASE_PRIVATE_KEY`  | `-----BEGIN PRIVATE KEY-----\nMIIE...`             | Firebase Console → Service Account     |
| `FIREBASE_CLIENT_EMAIL` | `firebase-adminsdk@xxx.iam.gserviceaccount.com`    | Firebase Console → Service Account     |
| `FIREBASE_DATABASE_URL` | `https://cinemaec-12345.firebaseio.com`            | Firebase Console → Settings            |
| `MAIL_HOST`             | `smtp.gmail.com`                                   | Proveedor de email                     |
| `MAIL_PORT`             | `587`                                              | Valor estándar SMTP                    |
| `MAIL_USER`             | `tu-email@gmail.com`                               | Tu cuenta de Gmail                     |
| `MAIL_PASSWORD`         | `abcd efgh ijkl mnop`                              | Google → App Passwords                 |
| `MAIL_FROM`             | `CinemaEC <noreply@cinemaec.com>`                  | Tu configuración                       |
| `CORS_ORIGIN`           | `https://cinemaec.vercel.app,https://cinemaec.com` | URLs de tu frontend                    |

## Paso 4: Configuraciones Especiales

### 🔥 FIREBASE_PRIVATE_KEY

Esta variable es especial porque contiene saltos de línea. Tienes 2 opciones:

**Opción A (Recomendada):** Pega el valor completo tal cual del JSON de Firebase:

```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7...
(toda la clave)
...
-----END PRIVATE KEY-----
```

**Opción B:** Reemplaza los saltos de línea con `\n`:

```
-----BEGIN PRIVATE KEY-----\nMIIEvQIBA...\n-----END PRIVATE KEY-----\n
```

### 📧 MAIL_PASSWORD (Gmail)

1. Ve a tu cuenta de Google
2. Security → 2-Step Verification (actívala si no la tienes)
3. App Passwords → Generate
4. Selecciona "Mail" y "Other" (escribe "Render")
5. Copia la contraseña de 16 caracteres (sin espacios)

### 🌐 CORS_ORIGIN

Lista de URLs separadas por comas **SIN ESPACIOS**:

```
https://frontend1.com,https://frontend2.com,https://www.frontend1.com
```

## Paso 5: Validar Configuración

Antes de desplegar, valida localmente:

```bash
# Carga tu archivo .env.production
source .env.production

# Ejecuta el validador
npm run validate:render
```

## Paso 6: Desplegar

1. Una vez todas las variables estén configuradas en Render
2. Haz push a tu rama `main`
3. Render automáticamente:
   - Detecta el cambio
   - Builda la imagen Docker
   - Despliega el servicio
   - Ejecuta migraciones de DB

## Verificación Post-Despliegue

### Healthcheck

```bash
curl https://cinema-ec-backend.onrender.com/health
```

Respuesta esperada:

```json
{
  "status": "ok",
  "timestamp": "2026-01-06T...",
  "uptime": 123.45
}
```

### Swagger API

Abre en tu navegador:

```
https://cinema-ec-backend.onrender.com/api
```

### Logs en Tiempo Real

En Render Dashboard → tu servicio → **Logs**

---

## ⚠️ Errores Comunes

| Error                  | Causa                             | Solución                                  |
| ---------------------- | --------------------------------- | ----------------------------------------- |
| `ECONNREFUSED`         | DB no accesible                   | Verifica DB_HOST, whitelist IPs de Render |
| `Invalid JWT`          | JWT_SECRET incorrecto             | Verifica que sea el mismo que en frontend |
| `Firebase auth failed` | Credenciales Firebase incorrectas | Revisa FIREBASE_PRIVATE_KEY format        |
| `SMTP auth failed`     | Contraseña de correo incorrecta   | Usa App Password, no contraseña normal    |
| `CORS error`           | CORS_ORIGIN no incluye el origen  | Añade la URL del frontend a CORS_ORIGIN   |

---

## 📚 Comandos Útiles

```bash
# Validar variables localmente
npm run validate:render

# Verificar conexión a DB
npm run db:check:prod

# Ver logs en tiempo real (si tienes Render CLI)
render logs -f

# Ejecutar migraciones manualmente
# (Conecta al Shell del servicio en Render Dashboard)
npm run migration:run
```

---

## 🆘 Necesitas Ayuda?

- [Documentación completa de Render](./RENDER_DEPLOYMENT.md)
- [Render Support](https://render.com/docs/support)
- [Render Community](https://community.render.com)
