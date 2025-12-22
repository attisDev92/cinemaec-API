import {
  IsEnum,
  IsString,
  IsInt,
  IsOptional,
  IsDateString,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ContractTypeEnum } from '../entities/contract.entity'

export class CreateContractDto {
  @ApiProperty({
    description: 'Nombre del administrador del espacio',
    example: 'Juan Pérez',
  })
  @IsString()
  adminName: string

  @ApiProperty({
    description: 'ID del espacio al que pertenece el contrato',
    example: 10,
  })
  @IsInt()
  spaceId: number

  @ApiProperty({
    description: 'Tipo de contrato',
    enum: ContractTypeEnum,
    example: ContractTypeEnum.SPACE,
  })
  @IsEnum(ContractTypeEnum)
  contractType: ContractTypeEnum

  @ApiProperty({
    description: 'URL del documento del contrato firmado',
    example:
      'https://storage.googleapis.com/cinema-ec.firebasestorage.app/test/space_document/123/contrato.pdf',
  })
  @IsString()
  documentUrl: string

  @ApiPropertyOptional({
    description:
      'Fecha de inicio del contrato (formato ISO 8601). Si no se especifica, se usa la fecha actual',
    example: '2025-11-25T12:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string

  @ApiPropertyOptional({
    description:
      'Fecha de expiración del contrato (formato ISO 8601). Si no se especifica, se calcula como startDate + 12 meses',
    example: '2026-11-25T12:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  expirationDate?: string
}
