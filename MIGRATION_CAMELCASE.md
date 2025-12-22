# Migración a CamelCase

## Descripción

Esta migración renombra todas las columnas de la base de datos de `snake_case` a `camelCase` para mantener consistencia con las convenciones de TypeScript/JavaScript.

## Tablas afectadas

### 1. Tabla `users`

| Nombre anterior            | Nombre nuevo             |
| -------------------------- | ------------------------ |
| `is_active`                | `isActive`               |
| `email_verification_token` | `emailVerificationToken` |
| `password_reset_token`     | `passwordResetToken`     |
| `password_reset_expires`   | `passwordResetExpires`   |
| `profile_id`               | `profileId`              |
| `last_login`               | `lastLogin`              |
| `created_at`               | `createdAt`              |

### 2. Tabla `users_profile`

| Nombre anterior | Nombre nuevo  |
| --------------- | ------------- |
| `full_name`     | `fullName`    |
| `legal_name`    | `legalName`   |
| `trade_name`    | `tradeName`   |
| `legal_status`  | `legalStatus` |
| `user_id`       | `userId`      |
| `created_at`    | `createdAt`   |
| `updated_at`    | `updatedAt`   |

### 3. Tabla `assets`

| Nombre anterior | Nombre nuevo   |
| --------------- | -------------- |
| `user_id`       | `userId`       |
| `document_type` | `documentType` |
| `owner_type`    | `ownerType`    |
| `owner_id`      | `ownerId`      |
| `firebase_path` | `firebasePath` |
| `created_at`    | `createdAt`    |
| `updated_at`    | `updatedAt`    |

## Ejecutar migración

```bash
# Ejecutar migración
npm run migration:run

# Revertir migración (si es necesario)
npm run migration:revert
```

## Cambios en el código

### Entidades

Todas las propiedades de las entidades ahora usan camelCase:

```typescript
// Antes
user.is_active
user.created_at

// Ahora
user.isActive
user.createdAt
```

### Servicios

Las queries de TypeORM ahora usan los nombres en camelCase:

```typescript
// Antes
query.andWhere('asset.user_id = :userId', { userId })

// Ahora
query.andWhere('asset.userId = :userId', { userId })
```

### DTOs y Responses

Las respuestas de la API ahora devuelven campos en camelCase:

```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "isActive": true,
    "hasProfile": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Nota importante

Esta es una migración **breaking change**. Después de ejecutarla:

- ✅ El backend TypeScript funcionará correctamente con los nuevos nombres
- ⚠️ Cualquier query SQL manual o herramienta externa debe actualizarse
- ⚠️ Frontend debe esperar campos en camelCase en las respuestas
