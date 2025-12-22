import { Test, TestingModule } from '@nestjs/testing'
import { ProfilesController } from './profiles.controller'
import { ProfilesService } from './profiles.service'
import { LegalStatus } from './entities/profile.entity'
import { JwtAuthGuard } from '../users/guards/jwt-auth.guard'

describe('ProfilesController', () => {
  let controller: ProfilesController

  const mockProfilesService = {
    create: jest.fn(),
    findByUserId: jest.fn(),
    updateOwn: jest.fn(),
    uploadAgreement: jest.fn(),
  }

  const mockJwtAuthGuard = {
    canActivate: jest.fn(() => true),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfilesController],
      providers: [
        {
          provide: ProfilesService,
          useValue: mockProfilesService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile()

    controller = module.get<ProfilesController>(ProfilesController)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('create', () => {
    it('should create a profile', async () => {
      const userId = 1
      const createProfileDto = {
        fullName: 'Juan Pérez',
        legalStatus: LegalStatus.NATURAL_PERSON,
        birthdate: '1990-01-01',
        province: 'Pichincha',
        city: 'Quito',
        address: 'Av. Principal 123',
        phone: '0987654321',
      }

      const expectedResult = {
        message: 'Perfil creado exitosamente',
        profile: {
          id: 1,
          ...createProfileDto,
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }

      mockProfilesService.create.mockResolvedValue(expectedResult)

      const req = { user: { sub: userId } }
      const result = await controller.create(req, createProfileDto)

      expect(mockProfilesService.create).toHaveBeenCalledWith(
        userId,
        createProfileDto,
      )
      expect(result).toEqual(expectedResult)
    })
  })

  describe('findOwn', () => {
    it('should return the user profile', async () => {
      const userId = 1
      const profile = {
        id: 1,
        userId,
        fullName: 'Juan Pérez',
        legalName: null,
        tradeName: null,
        legalStatus: LegalStatus.NATURAL_PERSON,
        birthdate: new Date('1990-01-01'),
        province: 'Pichincha',
        city: 'Quito',
        address: 'Av. Principal 123',
        phone: '0987654321',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockProfilesService.findByUserId.mockResolvedValue(profile)

      const req = { user: { sub: userId } }
      const result = await controller.findOne(req)

      expect(mockProfilesService.findByUserId).toHaveBeenCalledWith(userId)
      expect(result).toEqual(profile)
    })
  })

  describe('updateOwn', () => {
    it('should update the user profile', async () => {
      const userId = 1
      const updateProfileDto = {
        fullName: 'Juan Pérez Updated',
        phone: '0999999999',
      }

      const expectedResult = {
        message: 'Perfil actualizado exitosamente',
        profile: {
          id: 1,
          userId,
          fullName: 'Juan Pérez Updated',
          legalStatus: LegalStatus.NATURAL_PERSON,
          phone: '0999999999',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }

      mockProfilesService.updateOwn.mockResolvedValue(expectedResult)

      const req = { user: { sub: userId } }
      const result = await controller.updateOwn(req, updateProfileDto)

      expect(mockProfilesService.updateOwn).toHaveBeenCalledWith(
        userId,
        updateProfileDto,
      )
      expect(result).toEqual(expectedResult)
    })
  })

  describe('uploadAgreement', () => {
    it('should upload agreement document', async () => {
      const userId = 1
      const agreementDocumentId = 42

      const expectedResult = {
        message: 'Acuerdo subido exitosamente',
        profile: {
          id: 1,
          userId,
          fullName: 'Juan Pérez',
          legalStatus: LegalStatus.NATURAL_PERSON,
          agreementDocumentId: 42,
          hasUploadedAgreement: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }

      mockProfilesService.uploadAgreement.mockResolvedValue(expectedResult)

      const req = { user: { sub: userId } }
      const result = await controller.uploadAgreement(req, agreementDocumentId)

      expect(mockProfilesService.uploadAgreement).toHaveBeenCalledWith(
        userId,
        agreementDocumentId,
      )
      expect(result).toEqual(expectedResult)
      expect(result.profile.hasUploadedAgreement).toBe(true)
    })
  })
})
