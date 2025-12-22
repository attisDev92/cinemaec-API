import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class VerifyEmailDto {
  @ApiProperty({
    description: 'Token de verificación enviado por email',
    example: '266a9ed3e405c69f0a0c6f5c13011d0f392d237a4b2af0196735691557c74866',
  })
  @IsString({ message: 'El token debe ser un texto' })
  @IsNotEmpty({ message: 'El token es obligatorio' })
  token: string
}
