import { IsEnum, IsInt, IsNotEmpty, IsOptional } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { AssetTypeEnum, AssetOwnerEnum } from '../entities/asset.entity'

export class UploadAssetDto {
  @ApiProperty({
    description: 'Tipo de documento',
    enum: AssetTypeEnum,
    example: AssetTypeEnum.IMAGE,
  })
  @IsEnum(AssetTypeEnum)
  @IsNotEmpty()
  documentType: AssetTypeEnum

  @ApiProperty({
    description: 'Tipo de propietario del asset',
    enum: AssetOwnerEnum,
    example: AssetOwnerEnum.COMPANY_LOGO,
  })
  @IsEnum(AssetOwnerEnum)
  @IsNotEmpty()
  ownerType: AssetOwnerEnum

  @ApiPropertyOptional({
    description:
      'ID del propietario (space, company, location, movie, etc) - Opcional al crear',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  ownerId?: number

  @ApiProperty({
    description: 'Archivo a subir',
    type: 'string',
    format: 'binary',
  })
  file: any
}
