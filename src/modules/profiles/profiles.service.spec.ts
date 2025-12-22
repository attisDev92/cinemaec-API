import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ConflictException, NotFoundException } from '@nestjs/common'
import { ProfilesService } from './profiles.service'
import { Profile, LegalStatus } from './entities/profile.entity'
import { User } from '../users/entities/user.entity'

describe('ProfilesService', () => {
  let service: ProfilesService

  const mockProfilesRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  }

  const mockUsersRepository = {
    update: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfilesService,
        {
          provide: getRepositoryToken(Profile),
          useValue: mockProfilesRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepository,
        },
      ],
    }).compile()

    service = module.get<ProfilesService>(ProfilesService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('create', () => {
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

    it('should create a profile successfully', async () => {
      const savedProfile = {
        id: 1,
        ...createProfileDto,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockProfilesRepository.findOne.mockResolvedValue(null)
      mockProfilesRepository.create.mockReturnValue(savedProfile)
      mockProfilesRepository.save.mockResolvedValue(savedProfile)
      mockUsersRepository.update.mockResolvedValue({ affected: 1 })

      const result = await service.create(userId, createProfileDto)

      expect(mockProfilesRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
      })
      expect(mockProfilesRepository.create).toHaveBeenCalledWith({
        ...createProfileDto,
        userId,
      })
      expect(mockProfilesRepository.save).toHaveBeenCalledWith(savedProfile)
      expect(mockUsersRepository.update).toHaveBeenCalledWith(userId, {
        profileId: savedProfile.id,
      })
      expect(result).toEqual({
        message: 'Perfil creado exitosamente',
        profile: savedProfile,
      })
    })

    it('should throw ConflictException if profile already exists', async () => {
      const existingProfile = {
        id: 1,
        userId,
        fullName: 'Existing User',
        legalStatus: LegalStatus.NATURAL_PERSON,
      }

      mockProfilesRepository.findOne.mockResolvedValue(existingProfile)

      await expect(service.create(userId, createProfileDto)).rejects.toThrow(
        ConflictException,
      )
      expect(mockProfilesRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
      })
      expect(mockProfilesRepository.create).not.toHaveBeenCalled()
    })
  })

  describe('findByUserId', () => {
    const userId = 1

    it('should return a profile by userId', async () => {
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

      mockProfilesRepository.findOne.mockResolvedValue(profile)

      const result = await service.findByUserId(userId)

      expect(mockProfilesRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
        select: [
          'id',
          'fullName',
          'legalName',
          'tradeName',
          'legalStatus',
          'birthdate',
          'province',
          'city',
          'address',
          'phone',
          'agreementDocumentId',
          'hasUploadedAgreement',
          'userId',
          'createdAt',
          'updatedAt',
        ],
      })
      expect(result).toEqual(profile)
    })

    it('should throw NotFoundException if profile does not exist', async () => {
      mockProfilesRepository.findOne.mockResolvedValue(null)

      await expect(service.findByUserId(userId)).rejects.toThrow(
        NotFoundException,
      )
      expect(mockProfilesRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
        select: expect.any(Array),
      })
    })
  })

  describe('updateOwn', () => {
    const userId = 1
    const updateProfileDto = {
      fullName: 'Juan Pérez Updated',
      phone: '0999999999',
    }

    it('should update profile successfully', async () => {
      const existingProfile = {
        id: 1,
        userId,
        fullName: 'Juan Pérez',
        legalStatus: LegalStatus.NATURAL_PERSON,
        province: 'Pichincha',
        city: 'Quito',
        address: 'Av. Principal 123',
        phone: '0987654321',
      }

      const updatedProfile = {
        ...existingProfile,
        ...updateProfileDto,
        updatedAt: new Date(),
      }

      mockProfilesRepository.findOne.mockResolvedValue(existingProfile)
      mockProfilesRepository.save.mockResolvedValue(updatedProfile)

      const result = await service.updateOwn(userId, updateProfileDto)

      expect(mockProfilesRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
      })
      expect(mockProfilesRepository.save).toHaveBeenCalledWith({
        ...existingProfile,
        ...updateProfileDto,
      })
      expect(result).toEqual({
        message: 'Perfil actualizado exitosamente',
        profile: updatedProfile,
      })
    })

    it('should throw NotFoundException if profile does not exist', async () => {
      mockProfilesRepository.findOne.mockResolvedValue(null)

      await expect(service.updateOwn(userId, updateProfileDto)).rejects.toThrow(
        NotFoundException,
      )
      expect(mockProfilesRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
      })
      expect(mockProfilesRepository.save).not.toHaveBeenCalled()
    })
  })

  describe('uploadAgreement', () => {
    const userId = 1
    const agreementDocumentId = 42

    it('should upload agreement successfully', async () => {
      const existingProfile = {
        id: 1,
        fullName: 'Juan Pérez',
        legalStatus: LegalStatus.NATURAL_PERSON,
        userId,
        agreementDocumentId: null,
        hasUploadedAgreement: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const updatedProfile = {
        ...existingProfile,
        agreementDocumentId,
        hasUploadedAgreement: true,
        updatedAt: new Date(),
      }

      mockProfilesRepository.findOne.mockResolvedValue(existingProfile)
      mockProfilesRepository.save.mockResolvedValue(updatedProfile)

      const result = await service.uploadAgreement(userId, agreementDocumentId)

      expect(mockProfilesRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
      })
      expect(mockProfilesRepository.save).toHaveBeenCalledWith({
        ...existingProfile,
        agreementDocumentId,
        hasUploadedAgreement: true,
      })
      expect(result).toEqual({
        message: 'Acuerdo subido exitosamente',
        profile: updatedProfile,
      })
      expect(result.profile.hasUploadedAgreement).toBe(true)
      expect(result.profile.agreementDocumentId).toBe(agreementDocumentId)
    })

    it('should throw NotFoundException if profile does not exist', async () => {
      mockProfilesRepository.findOne.mockResolvedValue(null)

      await expect(
        service.uploadAgreement(userId, agreementDocumentId),
      ).rejects.toThrow(NotFoundException)
      expect(mockProfilesRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
      })
      expect(mockProfilesRepository.save).not.toHaveBeenCalled()
    })

    it('should update profile even if agreement was already uploaded', async () => {
      const existingProfile = {
        id: 1,
        fullName: 'Juan Pérez',
        legalStatus: LegalStatus.NATURAL_PERSON,
        userId,
        agreementDocumentId: 10,
        hasUploadedAgreement: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const updatedProfile = {
        ...existingProfile,
        agreementDocumentId,
        updatedAt: new Date(),
      }

      mockProfilesRepository.findOne.mockResolvedValue(existingProfile)
      mockProfilesRepository.save.mockResolvedValue(updatedProfile)

      const result = await service.uploadAgreement(userId, agreementDocumentId)

      expect(result.profile.agreementDocumentId).toBe(agreementDocumentId)
      expect(result.profile.hasUploadedAgreement).toBe(true)
    })
  })
})
