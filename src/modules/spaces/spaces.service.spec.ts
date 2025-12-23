import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { SpacesService } from './spaces.service'
import { Space, SpaceTypeEnum, SpaceStatusEnum } from './entities/space.entity'
import { NotFoundException, ForbiddenException } from '@nestjs/common'
import { User } from '../users/entities/user.entity'
import { SpaceReview } from './entities/space-review.entity'
import { AssetsService } from '../assets/assets.service'
import { NotificationsService } from '../notifications/notifications.service'

describe('SpacesService', () => {
  let service: SpacesService

  const mockQueryBuilder = {
    andWhere: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  }

  const mockSpacesRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  }

  const mockUserQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
  }

  const mockUsersRepository = {
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(() => mockUserQueryBuilder),
  }

  const mockSpaceReviewRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  }

  const mockAssetsService = {
    updateMultipleAssetsOwner: jest.fn(),
  }

  const mockNotificationsService = {
    create: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpacesService,
        {
          provide: getRepositoryToken(Space),
          useValue: mockSpacesRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepository,
        },
        {
          provide: getRepositoryToken(SpaceReview),
          useValue: mockSpaceReviewRepository,
        },
        {
          provide: AssetsService,
          useValue: mockAssetsService,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile()

    service = module.get<SpacesService>(SpacesService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('create', () => {
    it('should create a new space', async () => {
      const userId = 1
      const createSpaceDto = {
        name: 'Teatro Nacional',
        type: SpaceTypeEnum.THEATER,
        province: 'Pichincha',
        city: 'Quito',
        address: 'Calle Venezuela',
        email: 'contacto@teatro.ec',
        phone: '022951661',
        coordinates: [-0.2182, -78.5126],
        description: 'Teatro principal de la ciudad',
        target: 'Público general',
        managerName: 'María González',
        managerPhone: '0987654321',
        managerEmail: 'admin@teatro.ec',
        technicianInCharge: 'Carlos Mendoza',
        technicianRole: 'Técnico de Proyección',
        technicianPhone: '0991234567',
        technicianEmail: 'tecnico@teatro.ec',
        capacity: 850,
        projectionEquipment: ['Proyector 4K'],
        soundEquipment: ['Dolby Atmos'],
        screen: ['Pantalla 20x10m'],
        boxofficeRegistration: 'Sistema digital',
        accessibilities: ['Rampa de acceso', 'Baños adaptados'],
        services: ['wifi', 'cafetería'],
        operatingHistory: 'Operando desde hace 5 años',
        logoId: 1,
        photosId: [2, 3, 4],
        ciDocument: 5,
        managerDocument: 6,
        serviceBill: 7,
        operatingLicense: 8,
      }

      const expectedSpace = {
        id: 1,
        ...createSpaceDto,
        userId,
        status: SpaceStatusEnum.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockSpacesRepository.create.mockReturnValue(expectedSpace)
      mockSpacesRepository.save.mockResolvedValue(expectedSpace)

      const result = await service.create(userId, createSpaceDto as any)

      expect(mockSpacesRepository.create).toHaveBeenCalledWith({
        ...createSpaceDto,
        userId,
      })
      expect(mockSpacesRepository.save).toHaveBeenCalledWith(expectedSpace)
      expect(result).toEqual(expectedSpace)
    })
  })

  describe('findAll', () => {
    it('should return paginated spaces with filters', async () => {
      const queryDto = {
        type: SpaceTypeEnum.THEATER,
        page: 1,
        limit: 10,
      }

      const spaces = [
        {
          id: 1,
          name: 'Teatro 1',
          type: SpaceTypeEnum.THEATER,
          province: 'Pichincha',
          city: 'Quito',
          address: 'Calle 1',
          userId: 1,
          status: SpaceStatusEnum.ACTIVE,
        },
        {
          id: 2,
          name: 'Teatro 2',
          type: SpaceTypeEnum.THEATER,
          province: 'Guayas',
          city: 'Guayaquil',
          address: 'Calle 2',
          userId: 2,
          status: SpaceStatusEnum.VERIFIED,
        },
      ]

      mockQueryBuilder.getManyAndCount.mockResolvedValue([spaces, 2])

      const result = await service.findAll(queryDto)

      expect(result).toEqual({
        data: spaces,
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      })
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'space.type = :type',
        {
          type: SpaceTypeEnum.THEATER,
        },
      )
    })

    it('should return spaces without filters', async () => {
      const queryDto = { page: 1, limit: 10 }

      const spaces = [
        {
          id: 1,
          name: 'Espacio 1',
          type: SpaceTypeEnum.CINEMA,
          province: 'Pichincha',
          city: 'Quito',
          address: 'Calle 1',
          userId: 1,
          status: SpaceStatusEnum.ACTIVE,
        },
      ]

      mockQueryBuilder.getManyAndCount.mockResolvedValue([spaces, 1])

      const result = await service.findAll(queryDto)

      expect(result.data).toEqual(spaces)
      expect(result.total).toBe(1)
    })
  })

  describe('findOne', () => {
    it('should return a space by id', async () => {
      const spaceId = 1
      const space = {
        id: spaceId,
        name: 'Teatro Nacional',
        type: SpaceTypeEnum.THEATER,
        province: 'Pichincha',
        city: 'Quito',
        address: 'Calle Venezuela',
        userId: 1,
        status: SpaceStatusEnum.ACTIVE,
      }

      mockSpacesRepository.findOne.mockResolvedValue(space)

      const result = await service.findOne(spaceId)

      expect(mockSpacesRepository.findOne).toHaveBeenCalledWith({
        where: { id: spaceId },
      })
      expect(result).toEqual(space)
    })

    it('should throw NotFoundException if space not found', async () => {
      mockSpacesRepository.findOne.mockResolvedValue(null)

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException)
    })
  })

  describe('update', () => {
    it('should update a space successfully', async () => {
      const spaceId = 1
      const userId = 1
      const updateDto = {
        name: 'Teatro Nacional Actualizado',
        capacity: 900,
      }

      const existingSpace = {
        id: spaceId,
        name: 'Teatro Nacional',
        type: SpaceTypeEnum.THEATER,
        province: 'Pichincha',
        city: 'Quito',
        address: 'Calle Venezuela',
        userId,
        status: SpaceStatusEnum.ACTIVE,
      }

      const updatedSpace = {
        ...existingSpace,
        ...updateDto,
      }

      mockSpacesRepository.findOne.mockResolvedValue(existingSpace)
      mockSpacesRepository.save.mockResolvedValue(updatedSpace)

      const result = await service.update(spaceId, userId, updateDto)

      expect(result.name).toBe(updateDto.name)
      expect(result.capacity).toBe(updateDto.capacity)
    })

    it('should throw ForbiddenException if user is not the owner', async () => {
      const spaceId = 1
      const userId = 2
      const updateDto = { name: 'Nuevo nombre' }

      const existingSpace = {
        id: spaceId,
        name: 'Teatro Nacional',
        userId: 1, // Different user
        type: SpaceTypeEnum.THEATER,
        province: 'Pichincha',
        city: 'Quito',
        address: 'Calle Venezuela',
        status: SpaceStatusEnum.ACTIVE,
      }

      mockSpacesRepository.findOne.mockResolvedValue(existingSpace)

      await expect(service.update(spaceId, userId, updateDto)).rejects.toThrow(
        ForbiddenException,
      )
    })
  })

  describe('remove', () => {
    it('should remove a space successfully', async () => {
      const spaceId = 1
      const userId = 1

      const space = {
        id: spaceId,
        name: 'Teatro Nacional',
        userId,
        type: SpaceTypeEnum.THEATER,
        province: 'Pichincha',
        city: 'Quito',
        address: 'Calle Venezuela',
        status: SpaceStatusEnum.ACTIVE,
      }

      mockSpacesRepository.findOne.mockResolvedValue(space)
      mockSpacesRepository.remove.mockResolvedValue(space)

      await service.remove(spaceId, userId)

      expect(mockSpacesRepository.remove).toHaveBeenCalledWith(space)
    })

    it('should throw ForbiddenException if user is not the owner', async () => {
      const spaceId = 1
      const userId = 2

      const space = {
        id: spaceId,
        name: 'Teatro Nacional',
        userId: 1, // Different user
        type: SpaceTypeEnum.THEATER,
        province: 'Pichincha',
        city: 'Quito',
        address: 'Calle Venezuela',
        status: SpaceStatusEnum.ACTIVE,
      }

      mockSpacesRepository.findOne.mockResolvedValue(space)

      await expect(service.remove(spaceId, userId)).rejects.toThrow(
        ForbiddenException,
      )
    })
  })

  describe('updateStatus', () => {
    it('should update space status', async () => {
      const spaceId = 1
      const newStatus = SpaceStatusEnum.VERIFIED

      const space = {
        id: spaceId,
        name: 'Teatro Nacional',
        userId: 1,
        type: SpaceTypeEnum.THEATER,
        province: 'Pichincha',
        city: 'Quito',
        address: 'Calle Venezuela',
        status: SpaceStatusEnum.PENDING,
      }

      const updatedSpace = {
        ...space,
        status: newStatus,
      }

      mockSpacesRepository.findOne.mockResolvedValue(space)
      mockSpacesRepository.save.mockResolvedValue(updatedSpace)

      const result = await service.updateStatus(spaceId, newStatus)

      expect(result.status).toBe(newStatus)
      expect(mockSpacesRepository.save).toHaveBeenCalled()
    })
  })

  describe('validateAssetIds', () => {
    it('should return true for valid asset IDs', () => {
      const validIds = [1, 2, 3]

      const result = service.validateAssetIds(validIds)

      expect(result).toBe(true)
    })

    it('should return true for empty array', () => {
      const result = service.validateAssetIds([])

      expect(result).toBe(true)
    })

    it('should throw BadRequestException for invalid IDs', () => {
      const invalidIds = [1, -5, 3]

      expect(() => service.validateAssetIds(invalidIds)).toThrow()
    })
  })
})
