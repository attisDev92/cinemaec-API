# 🔥 Configuración de Credenciales de Firebase

## Pasos para obtener las credenciales

### 1. Acceder a Firebase Console

Ve a: https://console.firebase.google.com/

### 2. Seleccionar o crear proyecto

- Si no tienes proyecto, crea uno nuevo
- El `project_id` debe ser único (ej: `cinema-ec`)

### 3. Obtener las credenciales de Service Account

1. En Firebase Console, ve a: **⚙️ Project Settings** (Configuración del proyecto)
2. Selecciona la pestaña **Service Accounts**
3. Click en el botón **"Generate New Private Key"** (Generar nueva clave privada)
4. Se descargará un archivo JSON similar a:

```json
{
  "type": "service_account",
  "project_id": "cinema-ec",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@cinema-ec.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

### 4. Configurar el archivo .env

Del archivo JSON descargado, extrae estos valores y colócalos en tu `.env`:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=cinema-ec                                             # ← project_id del JSON
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@cinema-ec.iam.gserviceaccount.com  # ← client_email del JSON
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n"  # ← private_key del JSON (MANTÉN LAS COMILLAS)
FIREBASE_STORAGE_BUCKET=cinema-ec.appspot.com                             # ← {project_id}.appspot.com
```

⚠️ **IMPORTANTE**:

- El `FIREBASE_PRIVATE_KEY` debe mantener las comillas dobles y los `\n`
- NO borres los `\n`, son necesarios para el formato PEM
- NO subas el archivo JSON ni el `.env` a Git

### 5. Habilitar Firebase Storage

1. En Firebase Console, ve a **Build > Storage**
2. Click en **"Get Started"**
3. Selecciona las reglas de seguridad:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

4. Selecciona la ubicación (ej: `us-central1`)
5. Click en **"Done"**

### 6. Verificar configuración

Reinicia el servidor:

```bash
npm run start:dev
```

Deberías ver en los logs:

```
✅ Firebase Admin SDK inicializado
```

### 7. Probar subida de archivos

Usa el endpoint de assets:

```bash
curl -X POST http://localhost:3001/assets/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/image.jpg" \
  -F "documentType=image" \
  -F "ownerType=company_logo" \
  -F "ownerId=1"
```

## Estructura de carpetas en Firebase Storage

Los archivos se organizan así:

```
cinema-ec.appspot.com/
└── assets/
    ├── company_logo/
    │   └── {ownerId}/
    │       └── {timestamp}_filename.jpg
    ├── company_photo/
    │   └── {ownerId}/
    │       └── {timestamp}_filename.jpg
    ├── person_photo/
    │   └── {ownerId}/
    │       └── {timestamp}_filename.jpg
    └── image/
        └── {ownerId}/
            └── {timestamp}_filename.jpg
```

## Reglas de seguridad recomendadas (Producción)

Para producción, actualiza las reglas en Firebase Console:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Permitir lectura pública de todos los archivos
    match /{allPaths=**} {
      allow read: if true;
    }

    // Solo usuarios autenticados pueden escribir
    match /assets/{assetType}/{ownerId}/{fileName} {
      allow write: if request.auth != null;
      allow delete: if request.auth != null;
    }
  }
}
```

## Troubleshooting

### Error: "Failed to parse private key"

- Verifica que el `FIREBASE_PRIVATE_KEY` tenga las comillas dobles
- Verifica que los `\n` estén presentes en el string
- No debe haber espacios extras antes o después del `=`

### Error: "Invalid credential"

- Verifica que el `client_email` sea correcto
- Verifica que el `project_id` coincida con tu proyecto de Firebase
- Genera una nueva clave privada si la anterior expiró

### Error: "Storage bucket not found"

- Verifica que Firebase Storage esté habilitado en Firebase Console
- Verifica que el bucket name sea: `{project_id}.appspot.com`

## Seguridad

⚠️ **NUNCA subas a Git**:

- El archivo JSON de credenciales
- El archivo `.env` con las credenciales reales

✅ **Asegúrate de tener en `.gitignore`**:

```
.env
.env.local
.env.*.local
serviceAccountKey.json
firebase-credentials.json
```
