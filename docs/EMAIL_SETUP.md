# Configuración de Gmail para envío de emails

Para enviar emails usando Gmail, necesitas configurar una **Contraseña de Aplicación**.

## Pasos para obtener la contraseña de aplicación:

### 1. Habilitar verificación en 2 pasos

1. Ve a [Cuenta de Google](https://myaccount.google.com/)
2. Selecciona **Seguridad** en el menú lateral
3. En "Cómo inicias sesión en Google", selecciona **Verificación en 2 pasos**
4. Sigue los pasos para activarla

### 2. Crear contraseña de aplicación

1. Regresa a **Seguridad**
2. Busca **Contraseñas de aplicaciones** (aparece después de activar la verificación en 2 pasos)
3. Selecciona la aplicación: **Correo**
4. Selecciona el dispositivo: **Otro (nombre personalizado)**
5. Escribe "CinemaEC Backend" o el nombre que prefieras
6. Copia la contraseña de 16 caracteres que se genera

### 3. Configurar variables de entorno

Edita el archivo `.env` y actualiza las siguientes variables:

```env
# Email Configuration (Gmail)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=tu-email@gmail.com
MAIL_PASSWORD=xxxx xxxx xxxx xxxx  # La contraseña de aplicación de 16 caracteres
MAIL_FROM=CinemaEC <noreply@cinemaec.com>
```

## Verificar configuración

1. Inicia el servidor:

   ```bash
   npm run start:dev
   ```

2. Registra un nuevo usuario usando la API o Swagger

3. Revisa la bandeja de entrada del email registrado

## Solución de problemas

### Error: "Invalid login"

- Verifica que la verificación en 2 pasos esté activada
- Asegúrate de usar la contraseña de aplicación, no tu contraseña de Gmail
- Confirma que el email en `MAIL_USER` sea correcto

### Error: "Connection timeout"

- Verifica tu conexión a internet
- Algunos firewalls corporativos bloquean el puerto 587
- Intenta cambiar `MAIL_PORT` a 465 y `secure: true` en `emails.module.ts`

### No llega el email

- Revisa la carpeta de spam
- Verifica que el email del destinatario sea válido
- Revisa los logs del servidor para ver errores

## Alternativas a Gmail

Si prefieres usar otro servicio:

### SendGrid

```env
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USER=apikey
MAIL_PASSWORD=tu-api-key-de-sendgrid
```

### Mailgun

```env
MAIL_HOST=smtp.mailgun.org
MAIL_PORT=587
MAIL_USER=postmaster@tu-dominio.mailgun.org
MAIL_PASSWORD=tu-password-de-mailgun
```

### Outlook/Hotmail

```env
MAIL_HOST=smtp-mail.outlook.com
MAIL_PORT=587
MAIL_USER=tu-email@outlook.com
MAIL_PASSWORD=tu-password
```
