import { IsOptional, IsEnum, IsString, IsInt, Min } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { SpaceTypeEnum, SpaceStatusEnum } from '../entities/space.entity'

export class QuerySpacesDto {
  @ApiPropertyOptional({
    description: 'Filtrar por tipo de espacio',
    enum: SpaceTypeEnum,
  })
  @IsOptional()
  @IsEnum(SpaceTypeEnum)
  type?: SpaceTypeEnum

  @ApiPropertyOptional({
    description: 'Filtrar por estado del espacio',
    enum: SpaceStatusEnum,
  })
  @IsOptional()
  @IsEnum(SpaceStatusEnum)
  status?: SpaceStatusEnum

  @ApiPropertyOptional({
    description: 'Filtrar por provincia',
    example: 'Pichincha',
  })
  @IsOptional()
  @IsString()
  province?: string

  @ApiPropertyOptional({
    description: 'Filtrar por ciudad',
    example: 'Quito',
  })
  @IsOptional()
  @IsString()
  city?: string

  @ApiPropertyOptional({
    description: 'Buscar por nombre (búsqueda parcial)',
    example: 'Teatro',
  })
  @IsOptional()
  @IsString()
  name?: string

  @ApiPropertyOptional({
    description: 'Filtrar por ID de usuario propietario',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  userId?: number

  @ApiPropertyOptional({
    description: 'Número de página',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number

  @ApiPropertyOptional({
    description: 'Cantidad de resultados por página',
    example: 10,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number
}
