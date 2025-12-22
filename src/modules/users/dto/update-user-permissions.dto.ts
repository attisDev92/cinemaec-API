import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsArray, IsEnum, IsOptional } from 'class-validator'
import { PermissionEnum } from '../entities/user.entity'

export class UpdateUserPermissionsDto {
  @ApiPropertyOptional({
    description: 'Array de permisos del usuario (solo para admins)',
    enum: PermissionEnum,
    isArray: true,
    example: [PermissionEnum.ADMIN_SPACES, PermissionEnum.ADMIN_MOVIES],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(PermissionEnum, { each: true })
  permissions?: string[]
}
