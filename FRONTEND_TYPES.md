# Tipos TypeScript para Frontend

## Enums

```typescript
// User Role
export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  USER = 'user',
}

// Legal Status (Profile)
export enum LegalStatus {
  NATURAL_PERSON = 'natural_person',
  LEGAL_ENTITY = 'legal_entity',
}

// Asset Types
export enum AssetTypeEnum {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
  LOGO = 'logo',
  OTHER = 'other',
}

// Asset Owner Types
export enum AssetOwnerEnum {
  SPACE_LOGO = 'space_logo',
  SPACE_PHOTO = 'space_photo',
  USER_BC_PHOTO = 'user_bc_photo',
  COMPANY_LOGO = 'company_logo',
  COMPANY_PHOTOS = 'company_photos',
  LOCATION_PHOTOS = 'location_photos',
  MOVIE_STILLS = 'movie_stills',
  MOVIE_POSTER = 'movie_poster',
}
```

## User Types

```typescript
// User Entity
export interface User {
  id: number
  email: string
  cedula: string
  role: UserRole
  isActive: boolean
  emailVerificationToken: string | null
  passwordResetToken: string | null
  passwordResetExpires: Date | null
  profileId: number | null
  lastLogin: Date | null
  createdAt: Date
}

// Login Response
export interface LoginResponse {
  accessToken: string
  user: {
    id: number
    email: string
    cedula: string
    role: string
    is_active: boolean // Este campo se mantiene en snake_case en la respuesta
    has_profile: boolean // Este campo se mantiene en snake_case en la respuesta
  }
}

// User Profile Response (GET /users/me)
export interface UserProfileResponse {
  id: number
  email: string
  cedula: string
  role: string
  is_active: boolean // Este campo se mantiene en snake_case en la respuesta
  has_profile: boolean // Este campo se mantiene en snake_case en la respuesta
  last_login: Date | null // Este campo se mantiene en snake_case en la respuesta
}

// Register DTO
export interface RegisterDto {
  email: string
  cedula: string
  password: string
}

// Login DTO
export interface LoginDto {
  email: string
  password: string
}

// Change Password DTO
export interface ChangePasswordDto {
  currentPassword: string
  newPassword: string
}

// Forgot Password DTO
export interface ForgotPasswordDto {
  email: string
}

// Reset Password DTO
export interface ResetPasswordDto {
  token: string
  newPassword: string
}

// Verify Email DTO
export interface VerifyEmailDto {
  token: string
}
```

## Profile Types

```typescript
// Profile Entity
export interface Profile {
  id: number
  fullName: string
  legalName?: string | null
  tradeName?: string | null
  legalStatus: LegalStatus
  birthdate?: Date | null
  province: string | null
  city: string | null
  address: string | null
  phone: string | null
  userId: number
  createdAt: Date
  updatedAt: Date
}

// Create Profile DTO
export interface CreateProfileDto {
  fullName: string
  legalName?: string
  tradeName?: string
  legalStatus: LegalStatus
  birthdate?: string // Format: YYYY-MM-DD
  province?: string
  city?: string
  address?: string
  phone?: string
}

// Update Profile DTO
export interface UpdateProfileDto {
  fullName?: string
  legalName?: string
  tradeName?: string
  legalStatus?: LegalStatus
  birthdate?: string // Format: YYYY-MM-DD
  province?: string
  city?: string
  address?: string
  phone?: string
}

// Profile Response
export interface ProfileResponse {
  message: string
  profile: Profile
}
```

## Asset Types

```typescript
// Asset Entity
export interface Asset {
  id: number
  userId: number
  documentType: AssetTypeEnum
  ownerType: AssetOwnerEnum
  ownerId: number | null
  url: string
  firebasePath: string | null
  createdAt: Date
  updatedAt: Date
}

// Upload Asset DTO (FormData)
export interface UploadAssetDto {
  file: File
  documentType: AssetTypeEnum
  ownerType: AssetOwnerEnum
  ownerId?: number
}

// Query Assets DTO
export interface QueryAssetsDto {
  documentType?: AssetTypeEnum
  ownerType?: AssetOwnerEnum
  ownerId?: number
}
```

## API Response Types

```typescript
// Generic Success Response
export interface SuccessResponse {
  message: string
}

// Generic Error Response
export interface ErrorResponse {
  statusCode: number
  message: string | string[]
  error: string
}

// Paginated Response (para futuras implementaciones)
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
```

## Ejemplo de uso en Frontend

### React/Next.js con Axios

```typescript
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3001',
})

// Interceptor para agregar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Login
export const login = async (data: LoginDto): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/users/login', data)
  return response.data
}

// Get current user
export const getCurrentUser = async (): Promise<UserProfileResponse> => {
  const response = await api.get<UserProfileResponse>('/users/me')
  return response.data
}

// Get profile
export const getProfile = async (): Promise<Profile> => {
  const response = await api.get<Profile>('/profiles')
  return response.data
}

// Create profile
export const createProfile = async (
  data: CreateProfileDto,
): Promise<ProfileResponse> => {
  const response = await api.post<ProfileResponse>('/profiles', data)
  return response.data
}

// Update profile
export const updateProfile = async (
  data: UpdateProfileDto,
): Promise<ProfileResponse> => {
  const response = await api.patch<ProfileResponse>('/profiles', data)
  return response.data
}

// Upload asset
export const uploadAsset = async (data: UploadAssetDto): Promise<Asset> => {
  const formData = new FormData()
  formData.append('file', data.file)
  formData.append('documentType', data.documentType)
  formData.append('ownerType', data.ownerType)
  if (data.ownerId) {
    formData.append('ownerId', data.ownerId.toString())
  }

  const response = await api.post<Asset>('/assets/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

// Get assets with filters
export const getAssets = async (filters?: QueryAssetsDto): Promise<Asset[]> => {
  const response = await api.get<Asset[]>('/assets', { params: filters })
  return response.data
}

// Get my assets
export const getMyAssets = async (
  filters?: QueryAssetsDto,
): Promise<Asset[]> => {
  const response = await api.get<Asset[]>('/assets/my-assets', {
    params: filters,
  })
  return response.data
}

// Delete asset
export const deleteAsset = async (id: number): Promise<SuccessResponse> => {
  const response = await api.delete<SuccessResponse>(`/assets/${id}`)
  return response.data
}

// Replace asset
export const replaceAsset = async (id: number, file: File): Promise<Asset> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.put<Asset>(`/assets/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}
```

### React Hook Example

```typescript
import { useState, useEffect } from 'react'
import { getCurrentUser, UserProfileResponse } from '@/api/users'

export const useAuth = () => {
  const [user, setUser] = useState<UserProfileResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser()
        setUser(userData)
      } catch (err) {
        setError('Failed to fetch user')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    const token = localStorage.getItem('accessToken')
    if (token) {
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [])

  return { user, loading, error }
}
```

## Notas Importantes

1. **Campos en snake_case en respuestas**: Los campos `is_active`, `has_profile` y `last_login` en las respuestas de usuarios se mantienen en snake_case. Puedes transformarlos en el frontend si lo prefieres:

```typescript
// Transformar respuesta a camelCase completo
const transformUserResponse = (user: UserProfileResponse) => ({
  id: user.id,
  email: user.email,
  cedula: user.cedula,
  role: user.role,
  isActive: user.is_active,
  hasProfile: user.has_profile,
  lastLogin: user.last_login,
})
```

2. **Fechas**: TypeORM devuelve fechas como strings ISO 8601. Puedes convertirlas a objetos `Date` si es necesario:

```typescript
const profile: Profile = {
  ...data,
  createdAt: new Date(data.createdAt),
  updatedAt: new Date(data.updatedAt),
}
```

3. **FormData**: Para subir archivos, usa `FormData` y el header `Content-Type: multipart/form-data`.

4. **Tokens JWT**: Guarda el `accessToken` en `localStorage` o `sessionStorage` y agrégalo en el header `Authorization: Bearer {token}` en cada request protegido.
