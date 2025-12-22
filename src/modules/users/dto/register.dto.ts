import { ApiProperty } from '@nestjs/swagger'
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator'

export class RegisterDto {
  @ApiProperty({
    description: 'Email del usuario',
    example: 'usuario@ejemplo.com',
  })
  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string

  @ApiProperty({
    description: 'Número de cédula',
    example: '1234567890',
  })
  @IsString({ message: 'La cédula debe ser un texto' })
  @IsNotEmpty({ message: 'La cédula es requerida' })
  cedula: string

  @ApiProperty({
    description: 'Contraseña del usuario (mínimo 6 caracteres)',
    example: 'Password123',
    minLength: 6,
  })
  @IsString({ message: 'La contraseña debe ser un texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&\-_.+]{6,}$/, {
    message: 'La contraseña debe contener al menos una letra y un número',
  })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  password: string
}
