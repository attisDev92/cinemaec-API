import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'
import { SpaceReviewDecisionEnum } from '../entities/space-review.entity'

export class ReviewIssueDto {
  @ApiProperty({
    description: 'Nombre del campo del espacio con error',
    example: 'managerEmail',
  })
  @IsString()
  field: string

  @ApiProperty({
    description: 'Comentario del error o corrección',
    example: 'El email del administrador no es válido',
  })
  @IsString()
  comment: string
}

export class SubmitSpaceReviewDto {
  @ApiProperty({
    description: 'Decisión de la revisión',
    enum: SpaceReviewDecisionEnum,
    example: SpaceReviewDecisionEnum.REQUEST_CHANGES,
  })
  @IsEnum(SpaceReviewDecisionEnum)
  decision: SpaceReviewDecisionEnum

  @ApiPropertyOptional({
    description: 'Comentario general de la revisión',
    example: 'Por favor corrige los puntos indicados.',
  })
  @IsOptional()
  @IsString()
  generalComment?: string

  @ApiPropertyOptional({
    description: 'Lista de issues detectados',
    type: [ReviewIssueDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReviewIssueDto)
  issues?: ReviewIssueDto[]
}
