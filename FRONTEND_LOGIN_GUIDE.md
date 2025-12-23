# Guía de Login y Permisos para el Frontend

## 1. Estructura de Respuesta de Login

Cuando un usuario hace login en `POST /users/login`, la respuesta tiene esta estructura:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMsImVtYWlsIjoidGVzdGFkbWluQGV4YW1wbGUuY29tIiwiY2VkdWxhIjoiMTIzNDU2Nzg5Iiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzY2NDQ3Njg1OCwiyHAiOjE3NjcwNTI0NTh9.7FqN3cIz1vu_EFr5W10PTykXP7xNgjVOTdlHapi8Ubw",
  "user": {
    "id": 3,
    "email": "testadmin@example.com",
    "cedula": "123456789",
    "role": "admin",
    "is_active": true,
    "has_profile": false,
    "permissions": [
      "admin_spaces",
      "admin_movies",
      "approve_movies_request",
      "admin_users",
      "assign_roles",
      "view_reports",
      "export_data"
    ]
  }
}
```

## 2. Permisos Disponibles

El sistema cuenta con 7 permisos específicos:

| Permiso                  | Descripción                               |
| ------------------------ | ----------------------------------------- |
| `admin_spaces`           | Puede revisar y aprobar/rechazar espacios |
| `admin_movies`           | Puede gestionar películas del sistema     |
| `approve_movies_request` | Puede aprobar solicitudes de películas    |
| `admin_users`            | Puede gestionar usuarios y sus roles      |
| `assign_roles`           | Puede asignar roles a usuarios            |
| `view_reports`           | Puede visualizar reportes del sistema     |
| `export_data`            | Puede exportar datos del sistema          |

## 3. Roles Disponibles

El sistema tiene 3 roles principales:

- **admin**: Acceso completo a todas las funcionalidades de administración
- **editor**: Acceso limitado a crear y editar contenido
- **user**: Acceso básico a funcionalidades de usuario

## 4. Cómo Guardar el Login en el Frontend

### Option A: LocalStorage (React/Vue)

```javascript
// Después de hacer login
const loginResponse = await fetch('/users/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
})

const data = await loginResponse.json()

// Guardar token y usuario
localStorage.setItem('accessToken', data.accessToken)
localStorage.setItem('user', JSON.stringify(data.user))
localStorage.setItem('permissions', JSON.stringify(data.user.permissions))
```

### Option B: Context API (React)

```javascript
const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [permissions, setPermissions] = useState([])
  const [token, setToken] = useState(null)

  const login = async (email, password) => {
    const response = await fetch('/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()
    setToken(data.accessToken)
    setUser(data.user)
    setPermissions(data.user.permissions || [])

    return data
  }

  return (
    <AuthContext.Provider value={{ user, permissions, token, login }}>
      {children}
    </AuthContext.Provider>
  )
}
```

## 5. Cómo Verificar Permisos en el Frontend

### Método de Verificación Simple

```javascript
// Verificar si el usuario tiene un permiso específico
function hasPermission(permissions, requiredPermission) {
  return permissions.includes(requiredPermission)
}

// Uso
const canReviewSpaces = hasPermission(user.permissions, 'admin_spaces')
const canExportData = hasPermission(user.permissions, 'export_data')
```

### Con Componentes Protegidos (React)

```javascript
function ProtectedComponent({ requiredPermission, children }) {
  const { permissions } = useContext(AuthContext)

  if (!permissions.includes(requiredPermission)) {
    return <div>No tienes permiso para acceder a esta sección</div>
  }

  return children
}

// Uso
;<ProtectedComponent requiredPermission="admin_spaces">
  <SpaceReviewPanel />
</ProtectedComponent>
```

## 6. Mapa de Módulos por Permiso

### Panel de Admin - Espacios

- **Permiso Requerido**: `admin_spaces`
- **Endpoint**: `GET /spaces`
- **Funcionalidades**:
  - Listar todos los espacios
  - Revisar espacios pendientes
  - Aprobar/Rechazar espacios
  - Ver historial de revisiones

```javascript
// POST /spaces/:id/review
{
  "decision": "approve" | "request_changes" | "reject",
  "generalComment": "Comentario general",
  "issues": [
    { "field": "name", "comment": "Necesita corrección" }
  ]
}
```

### Panel de Películas

- **Permiso Requerido**: `admin_movies`
- **Funcionalidades**: Gestionar películas

### Aprobar Solicitudes

- **Permiso Requerido**: `approve_movies_request`
- **Funcionalidades**: Revisar y aprobar solicitudes

### Panel de Usuarios

- **Permiso Requerido**: `admin_users`
- **Funcionalidades**: Gestionar usuarios

### Asignar Roles

- **Permiso Requerido**: `assign_roles`
- **Endpoint**: `PUT /users/:id/permissions`
- **Payload**:

```json
{
  "role": "admin" | "editor" | "user",
  "permissions": [
    "admin_spaces",
    "admin_movies",
    "view_reports"
  ]
}
```

### Reportes

- **Permiso Requerido**: `view_reports`
- **Funcionalidades**: Ver estadísticas y reportes

### Exportar Datos

- **Permiso Requerido**: `export_data`
- **Funcionalidades**: Exportar datos a CSV/Excel

## 7. Token JWT - Decodificación

El `accessToken` es un JWT que contiene:

```json
{
  "sub": 3,
  "email": "testadmin@example.com",
  "cedula": "123456789",
  "role": "admin",
  "iat": 1766447658,
  "exp": 1767052458
}
```

**Decodificador en el navegador (sin validación)**:

```javascript
function decodeToken(token) {
  const base64Url = token.split('.')[1]
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      })
      .join(''),
  )
  return JSON.parse(jsonPayload)
}

// Uso
const decoded = decodeToken(accessToken)
console.log(decoded.exp) // Fecha de expiración
```

## 8. Usar Token en Requests Autenticados

### Con Fetch API

```javascript
const response = await fetch('/spaces', {
  method: 'GET',
  headers: {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
})
```

### Con Axios

```javascript
axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`

// O en cada request
const response = await axios.get('/spaces', {
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
})
```

## 9. Control de Acceso por Ruta (Ejemplo React Router)

```javascript
function ProtectedRoute({ children, requiredPermission }) {
  const { user, permissions } = useContext(AuthContext)

  if (!user) {
    return <Navigate to="/login" />
  }

  if (requiredPermission && !permissions.includes(requiredPermission)) {
    return <Navigate to="/unauthorized" />
  }

  return children
}

// Uso
;<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route
    path="/admin/spaces"
    element={
      <ProtectedRoute requiredPermission="admin_spaces">
        <SpaceAdminPanel />
      </ProtectedRoute>
    }
  />
  <Route
    path="/admin/users"
    element={
      <ProtectedRoute requiredPermission="admin_users">
        <UserAdminPanel />
      </ProtectedRoute>
    }
  />
</Routes>
```

## 10. Flujo Completo de Login

```
1. Usuario ingresa email y contraseña
   ↓
2. POST /users/login
   ↓
3. Backend devuelve { accessToken, user }
   ↓
4. Frontend guarda:
   - Token en localStorage/cookies
   - User data en Context/State
   - Permissions array para verificaciones
   ↓
5. Para cada request protegido:
   - Adjuntar header: Authorization: Bearer {token}
   ↓
6. Mostrar/Ocultar componentes según permissions
```

## Ejemplo Completo de Integración (React)

```javascript
import React, { createContext, useState, useContext } from 'react'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })

  const [token, setToken] = useState(() => localStorage.getItem('accessToken'))

  const login = async (email, password) => {
    const response = await fetch('/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('user', JSON.stringify(data.user))

    setToken(data.accessToken)
    setUser(data.user)

    return data
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  const hasPermission = (permission) => {
    return user?.permissions?.includes(permission) ?? false
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        hasPermission,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
```

## Endpoints de Referencia

| Método | Endpoint               | Requiere Permiso | Descripción                           |
| ------ | ---------------------- | ---------------- | ------------------------------------- |
| POST   | /users/login           | -                | Login de usuario                      |
| POST   | /users/register        | -                | Registrar nuevo usuario               |
| GET    | /users/me              | -                | Obtener datos del usuario autenticado |
| GET    | /spaces                | admin_spaces     | Listar espacios para revisión         |
| POST   | /spaces/:id/review     | admin_spaces     | Revisar un espacio                    |
| GET    | /spaces/:id/reviews    | admin_spaces     | Ver historial de revisiones           |
| PUT    | /users/:id/permissions | assign_roles     | Asignar permisos a usuario            |
