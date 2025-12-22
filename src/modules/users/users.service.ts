import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcrypt'
import { randomBytes } from 'crypto'
import { JwtService } from '@nestjs/jwt'
import { User } from './entities/user.entity'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { EmailsService } from '../emails/emails.service'
import { Profile } from '../profiles/entities/profile.entity'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Profile)
    private profilesRepository: Repository<Profile>,
    private emailsService: EmailsService,
    private jwtService: JwtService,
  ) {}

  /**
   * Registra un nuevo usuario en el sistema
   */
  async register(registerDto: RegisterDto): Promise<{
    message: string
    userId: number
  }> {
    const { email, cedula, password } = registerDto

    // Verificar si el email ya existe
    const existingEmail = await this.usersRepository.findOne({
      where: { email },
    })
    if (existingEmail) {
      throw new ConflictException('El email ya está registrado')
    }

    // Verificar si la cédula ya existe
    const existingCedula = await this.usersRepository.findOne({
      where: { cedula },
    })
    if (existingCedula) {
      throw new ConflictException('La cédula ya está registrada')
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generar token de verificación
    const emailVerificationToken = randomBytes(32).toString('hex')

    // Crear el usuario
    const user = this.usersRepository.create({
      email,
      cedula,
      password: hashedPassword,
      isActive: false,
      emailVerificationToken: emailVerificationToken,
    })

    // Guardar en la base de datos
    const savedUser = await this.usersRepository.save(user)

    // Enviar email de verificación
    await this.emailsService.sendVerificationEmail(
      email,
      emailVerificationToken,
    )

    return {
      message:
        'Usuario registrado exitosamente. Por favor verifica tu email para activar tu cuenta.',
      userId: savedUser.id,
    }
  }

  /**
   * Autentica un usuario y devuelve un token JWT
   */
  async login(loginDto: LoginDto): Promise<{
    accessToken: string
    user: {
      id: number
      email: string
      cedula: string
      role: string
      is_active: boolean
      has_profile: boolean
    }
  }> {
    const { email, password } = loginDto

    // Buscar usuario por email (incluyendo el password)
    const user = await this.usersRepository.findOne({
      where: { email },
      select: ['id', 'email', 'cedula', 'password', 'role', 'isActive'],
    })

    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas')
    }

    // Verificar que la cuenta esté activa
    if (!user.isActive) {
      throw new UnauthorizedException(
        'Tu cuenta no está activa. Contacta al administrador.',
      )
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales incorrectas')
    }

    // Verificar si tiene perfil
    const profile = await this.profilesRepository.findOne({
      where: { userId: user.id },
    })
    const hasProfile = !!profile

    // Actualizar last_login
    user.lastLogin = new Date()
    await this.usersRepository.save(user)

    // Generar token JWT
    const payload = {
      sub: user.id,
      email: user.email,
      cedula: user.cedula,
      role: user.role,
    }
    const accessToken = this.jwtService.sign(payload)

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        cedula: user.cedula,
        role: user.role,
        is_active: user.isActive,
        has_profile: hasProfile,
      },
    }
  }

  /**
   * Verifica el email de un usuario mediante el token
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    // Buscar usuario por token
    const user = await this.usersRepository.findOne({
      where: { emailVerificationToken: token },
    })

    if (!user) {
      throw new BadRequestException('Token de verificación inválido o expirado')
    }

    if (user.isActive) {
      throw new BadRequestException('El email ya ha sido verificado')
    }

    // Activar usuario
    user.isActive = true
    user.emailVerificationToken = null

    await this.usersRepository.save(user)

    return {
      message: 'Email verificado exitosamente. Ya puedes iniciar sesión.',
    }
  }

  /**
   * Obtiene el perfil del usuario autenticado
   */
  async getProfile(userId: number): Promise<{
    id: number
    email: string
    cedula: string
    role: string
    is_active: boolean
    has_profile: boolean
    has_uploaded_agreement: boolean
    last_login: Date | null
  }> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    })

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado')
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Tu cuenta ha sido desactivada')
    }

    // Verificar si tiene perfil y si ha subido el acuerdo
    const profile = await this.profilesRepository.findOne({
      where: { userId: user.id },
      select: ['id', 'hasUploadedAgreement'],
    })
    const hasProfile = !!profile
    const hasUploadedAgreement = profile?.hasUploadedAgreement || false

    return {
      id: user.id,
      email: user.email,
      cedula: user.cedula,
      role: user.role,
      is_active: user.isActive,
      has_profile: hasProfile,
      has_uploaded_agreement: hasUploadedAgreement,
      last_login: user.lastLogin,
    }
  }

  /**
   * Cambiar contraseña del usuario autenticado
   */
  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'password'],
    })

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado')
    }

    // Verificar contraseña actual
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isPasswordValid) {
      throw new UnauthorizedException('La contraseña actual es incorrecta')
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Actualizar contraseña
    await this.usersRepository.update(userId, {
      password: hashedPassword,
    })

    return {
      message: 'Contraseña actualizada exitosamente',
    }
  }

  /**
   * Solicitar recuperación de contraseña
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({
      where: { email },
    })

    // Por seguridad, siempre devolvemos el mismo mensaje aunque el email no exista
    if (!user) {
      return {
        message:
          'Si el email existe, recibirás un enlace para restablecer tu contraseña.',
      }
    }

    // Generar token de recuperación (válido por 1 hora)
    const resetToken = randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1)

    // Guardar token
    await this.usersRepository.update(user.id, {
      passwordResetToken: resetToken,
      passwordResetExpires: expiresAt,
    })

    // Enviar email con el token
    await this.emailsService.sendPasswordResetEmail(email, resetToken)

    return {
      message:
        'Si el email existe, recibirás un enlace para restablecer tu contraseña.',
    }
  }

  /**
   * Restablecer contraseña con token
   */
  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({
      where: { passwordResetToken: token },
    })

    if (!user) {
      throw new BadRequestException('Token inválido o expirado')
    }

    // Verificar que el token no haya expirado
    if (!user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      throw new BadRequestException('El token ha expirado')
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Actualizar contraseña y limpiar tokens
    await this.usersRepository.update(user.id, {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    })

    return {
      message:
        'Contraseña restablecida exitosamente. Ya puedes iniciar sesión.',
    }
  }
}
