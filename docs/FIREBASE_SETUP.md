# Configuración de Firebase Storage para Assets Module

## Variables de Entorno Requeridas

Añade estas variables a tu archivo `.env` o `.env.development`:

```bash
# Firebase Configuration
FIREBASE_PROJECT_ID=tu-proyecto-id
FIREBASE_CLIENT_EMAIL=tu-service-account@tu-proyecto.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
```

## Cómo obtener las credenciales de Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto o crea uno nuevo
3. Ve a **Project Settings** (⚙️) → **Service Accounts**
4. Click en **Generate New Private Key**
5. Se descargará un archivo JSON con la siguiente estructura:

```json
{
  "type": "service_account",
  "project_id": "tu-proyecto-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "tu-service-account@tu-proyecto.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

6. Copia los valores:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (mantén los `\n`)

7. Para el Storage Bucket:
   - Ve a **Storage** en el menú lateral
   - El bucket es algo como: `tu-proyecto.appspot.com`
   - Cópialo a `FIREBASE_STORAGE_BUCKET`

## Estructura de carpetas en Firebase Storage

Los archivos se organizarán automáticamente de la siguiente manera:

```
assets/
├── space_logo/
│   └── {owner_id}/
│       └── timestamp_filename.jpg
├── space_photo/
│   └── {owner_id}/
├── user_bc_photo/
│   └── {owner_id}/
├── company_logo/
│   └── {owner_id}/
├── company_photos/
│   └── {owner_id}/
├── location_photos/
│   └── {owner_id}/
├── movie_stills/
│   └── {owner_id}/
└── movie_poster/
    └── {owner_id}/
```

## Endpoints disponibles

### 1. Subir archivo

```bash
POST /assets/upload
Content-Type: multipart/form-data
Authorization: Bearer {token}

Body:
- file: archivo (binary)
- document_type: "IMAGE" | "VIDEO" | "DOCUMENT" | "LOGO" | "OTHER"
- owner_type: "SPACE_LOGO" | "SPACE_PHOTO" | "USER_BC_PHOTO" | etc.
- owner_id: number (opcional)
```

### 2. Obtener todos los assets

```bash
GET /assets?document_type=IMAGE&owner_type=SPACE_LOGO&owner_id=1
Authorization: Bearer {token}
```

### 3. Obtener mis assets

```bash
GET /assets/my-assets
Authorization: Bearer {token}
```

### 4. Obtener un asset por ID

```bash
GET /assets/:id
Authorization: Bearer {token}
```

### 5. Reemplazar un archivo

```bash
PUT /assets/:id
Content-Type: multipart/form-data
Authorization: Bearer {token}

Body:
- file: nuevo archivo (binary)
```

### 6. Eliminar un asset

```bash
DELETE /assets/:id
Authorization: Bearer {token}
```

## Ejecutar migración

```bash
npm run migration:run
```

## Ejemplo de uso con cURL

```bash
curl -X POST http://localhost:3001/assets/upload \
  -H "Authorization: Bearer tu-jwt-token" \
  -F "file=@/path/to/image.jpg" \
  -F "document_type=IMAGE" \
  -F "owner_type=SPACE_LOGO" \
  -F "owner_id=1"
```

## Notas importantes

- Todos los endpoints requieren autenticación JWT
- Los archivos se suben automáticamente a Firebase Storage
- La metadata se guarda en PostgreSQL (tabla `assets`)
- Al eliminar un asset, se elimina tanto de Firebase como de la BD
- Al reemplazar un archivo, se elimina el antiguo de Firebase
- Los archivos son públicos por defecto en Firebase Storage
