import { Test, TestingModule } from '@nestjs/testing'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { UserRole } from './entities/user.entity'

describe('UsersController', () => {
  let controller: UsersController

  const mockUsersService = {
    register: jest.fn(),
    login: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile()

    controller = module.get<UsersController>(UsersController)

    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('register', () => {
    it('should register a new user', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        cedula: '1234567890',
        password: 'Password123',
      }

      const expectedResult = {
        message: 'Usuario registrado exitosamente.',
        userId: 1,
      }

      mockUsersService.register.mockResolvedValue(expectedResult)

      const result = await controller.register(registerDto)

      expect(mockUsersService.register).toHaveBeenCalledWith(registerDto)
      expect(result).toEqual(expectedResult)
    })

    it('should call service with correct parameters', async () => {
      const registerDto: RegisterDto = {
        email: 'user@test.com',
        cedula: '0987654321',
        password: 'SecurePass456',
      }

      mockUsersService.register.mockResolvedValue({
        message: 'Success',
        userId: 2,
      })

      await controller.register(registerDto)

      expect(mockUsersService.register).toHaveBeenCalledTimes(1)
      expect(mockUsersService.register).toHaveBeenCalledWith(registerDto)
    })
  })

  describe('login', () => {
    it('should login successfully', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Password123',
      }

      const expectedResult = {
        accessToken: 'jwt.token.here',
        user: {
          id: 1,
          email: 'test@example.com',
          cedula: '1234567890',
          role: UserRole.USER,
          isActive: true,
        },
      }

      mockUsersService.login.mockResolvedValue(expectedResult)

      const result = await controller.login(loginDto)

      expect(mockUsersService.login).toHaveBeenCalledWith(loginDto)
      expect(result).toEqual(expectedResult)
    })

    it('should call service with correct parameters', async () => {
      const loginDto: LoginDto = {
        email: 'user@test.com',
        password: 'SecurePass456',
      }

      mockUsersService.login.mockResolvedValue({
        accessToken: 'token',
        user: {
          id: 2,
          email: 'user@test.com',
          cedula: '0987654321',
          role: UserRole.USER,
          isActive: true,
        },
      })

      await controller.login(loginDto)

      expect(mockUsersService.login).toHaveBeenCalledTimes(1)
      expect(mockUsersService.login).toHaveBeenCalledWith(loginDto)
    })
  })
})
