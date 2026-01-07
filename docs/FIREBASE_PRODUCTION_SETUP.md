# Configuración de Firebase para Producción

## 1. Obtener Credenciales de Firebase

### Paso 1: Ir a Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto de CinemaEC
3. Ve a **Configuración del Proyecto** (ícono de engranaje en la esquina superior izquierda)

### Paso 2: Generar Clave Privada

1. Selecciona la pestaña **Cuentas de Servicio**
2. Haz clic en **Generar Nueva Clave Privada**
3. Se descargará un archivo JSON con tus credenciales

El archivo JSON contendrá:

```json
{
  "type": "service_account",
  "project_id": "tu-proyecto-id",
  "private_key_id": "xxx",
  "private_key": "-----BEGIN PRIVATE KEY-----\nxxx\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxx@tu-proyecto.iam.gserviceaccount.com",
  "client_id": "xxx",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs"
}
```

## 2. Configurar Variables de Entorno

### Para Desarrollo (.env.development)

```env
# Mantener PostgreSQL en desarrollo
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_contraseña
DB_NAME=cinemaec

# Firebase (opcional en desarrollo)
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
FIREBASE_DATABASE_URL=
```

### Para Producción (.env.production)

```env
NODE_ENV=production
PORT=3001

# PostgreSQL (si lo usas en la nube, ej: AWS RDS, Google Cloud SQL)
DB_HOST=tu-db-host.cloud.google.com
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_contraseña_segura
DB_NAME=cinemaec

# Firebase Credentials (del archivo descargado)
FIREBASE_PROJECT_ID=tu-proyecto-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@tu-proyecto.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://tu-proyecto.firebaseio.com

# JWT Secret (genera uno seguro)
JWT_SECRET=tu_jwt_secret_muy_seguro_y_largo

# Email
MAIL_USER=tu_email@gmail.com
MAIL_PASSWORD=tu_app_password

# CORS
CORS_ORIGIN=https://tu-dominio.com
```

## 3. Opciones de Configuración para Producción

### Opción A: PostgreSQL + Firebase (Recomendado)

- **Base de Datos Principal**: PostgreSQL (Cloud SQL, RDS, etc.)
- **Firebase**: Para almacenamiento de archivos, autenticación adicional, logs

```typescript
// En producción, ambos servicios funcionan juntos
// PostgreSQL maneja datos estructurados
// Firebase maneja archivos y autenticación
```

### Opción B: Solo Firebase Firestore

Si quieres migrar completamente a Firebase:

1. Instala `@nestjs/firebase-admin`:

```bash
npm install @nestjs/firebase-admin firebase-admin
```

2. Usa `FirestoreModule` en lugar de `TypeOrmModule`:

```typescript
// En app.module.ts
FirestoreModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => ({
    projectId: configService.get('env.FIREBASE_PROJECT_ID'),
    privateKey: configService.get('env.FIREBASE_PRIVATE_KEY'),
    clientEmail: configService.get('env.FIREBASE_CLIENT_EMAIL'),
  }),
})
```

## 4. Usar Firebase Service en tu Código

```typescript
// En cualquier servicio
import { FirebaseService } from './common/firebase/firebase.service'

@Injectable()
export class ExampleService {
  constructor(private firebaseService: FirebaseService) {}

  async saveData(id: string, data: any) {
    // Guardar en Firestore
    await this.firebaseService.saveDocument('spaces', id, data)
  }

  async getData(id: string) {
    // Obtener de Firestore
    return await this.firebaseService.getDocument('spaces', id)
  }
}
```

## 5. Desplegar en Producción

### Con Google Cloud Run (Recomendado para Firebase)

```bash
# 1. Instalar Google Cloud CLI
# https://cloud.google.com/sdk/docs/install

# 2. Autenticar
gcloud auth login

# 3. Configurar proyecto
gcloud config set project tu-proyecto-id

# 4. Crear archivo .env.production con tus variables
# (NO commitear a Git, usar Cloud Run Secrets o Terraform)

# 5. Deployar
gcloud run deploy cinemaec-backend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production \
  --env-vars-file .env.production
```

### Con Heroku

```bash
# 1. Instalar Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# 2. Crear aplicación
heroku create cinemaec-backend

# 3. Agregar variables de entorno
heroku config:set NODE_ENV=production
heroku config:set DB_HOST=tu-host
heroku config:set FIREBASE_PROJECT_ID=tu-id
# ... resto de variables

# 4. Deployar
git push heroku main
```

### Con AWS (ECS + RDS)

Usar Terraform o AWS CloudFormation para:

- ECS Fargate para la aplicación
- RDS PostgreSQL para la base de datos
- S3 + CloudFront para archivos (integrado con Firebase Storage)
- Secrets Manager para las variables sensibles

## 6. Monitoreo en Producción

Usa Firebase Analytics y Monitoring:

```typescript
// Agregar tracking en tus servicios
import * as Sentry from '@sentry/node'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
})
```

## 7. Consideraciones de Seguridad

✅ **Hazlo:**

- Usa `.env.production` con valores reales (nunca en Git)
- Activa 2FA en tu cuenta de Firebase
- Usa Secrets Manager en tu proveedor de hosting
- Implementa CORS correctamente
- Usa HTTPS en todas las conexiones

❌ **No hagas:**

- Exponer `FIREBASE_PRIVATE_KEY` en público
- Commitear archivos `.env.production`
- Usar la misma contraseña para desarrollo y producción
- Acceder directamente a Firestore desde el frontend sin reglas

## 8. Reglas de Seguridad Firestore

En Firebase Console → Firestore → Reglas:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Admin: acceso total
    match /{document=**} {
      allow read, write: if request.auth.token.admin == true;
    }

    // Users: solo leer y escribir sus datos
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Spaces: solo propietarios pueden escribir
    match /spaces/{spaceId} {
      allow read: if true;
      allow write: if request.auth.uid == resource.data.userId;
    }
  }
}
```

## Siguiente Pasos

1. Descarga las credenciales de Firebase
2. Crea `.env.production` localmente
3. Prueba: `npm run start:prod`
4. Elige tu proveedor de hosting
5. Configura variables de entorno en la plataforma
6. Deployar 🚀
