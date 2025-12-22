import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsBoolean } from 'class-validator'

export class MarkAsReadDto {
  @ApiPropertyOptional({
    description: 'Marcar como leída',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean
}
