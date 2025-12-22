import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsEnum, IsOptional, IsInt } from 'class-validator'
import { NotificationTypeEnum } from '../entities/notification.entity'

export class CreateNotificationDto {
  @ApiProperty({
    description: 'ID del usuario que recibirá la notificación',
    example: 5,
  })
  @IsInt()
  userId: number

  @ApiProperty({
    description: 'Título de la notificación',
    example: 'Espacio aprobado',
  })
  @IsString()
  title: string

  @ApiProperty({
    description: 'Mensaje de la notificación',
    example: 'Tu espacio "Teatro Nacional" ha sido aprobado exitosamente',
  })
  @IsString()
  message: string

  @ApiPropertyOptional({
    description: 'Tipo de notificación',
    enum: NotificationTypeEnum,
    default: NotificationTypeEnum.INFO,
    example: NotificationTypeEnum.SUCCESS,
  })
  @IsOptional()
  @IsEnum(NotificationTypeEnum)
  type?: NotificationTypeEnum

  @ApiPropertyOptional({
    description: 'Link opcional para redirigir al usuario',
    example: '/spaces/123',
  })
  @IsOptional()
  @IsString()
  link?: string

  @ApiPropertyOptional({
    description: 'Tipo de referencia (space, contract, profile, etc)',
    example: 'space',
  })
  @IsOptional()
  @IsString()
  referenceType?: string

  @ApiPropertyOptional({
    description: 'ID de la referencia',
    example: 123,
  })
  @IsOptional()
  @IsInt()
  referenceId?: number
}
