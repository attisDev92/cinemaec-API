import { Test, TestingModule } from '@nestjs/testing'
import { SpacesController } from './spaces.controller'
import { SpacesService } from './spaces.service'
import { SpaceTypeEnum, SpaceStatusEnum } from './entities/space.entity'
import { JwtAuthGuard } from '../users/guards/jwt-auth.guard'

describe('SpacesController', () => {
  let controller: SpacesController

  const mockSpacesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findMySpaces: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    updateStatus: jest.fn(),
    validateAssetIds: jest.fn(),
  }

  const mockJwtAuthGuard = {
    canActivate: jest.fn(() => true),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpacesController],
      providers: [
        {
          provide: SpacesService,
          useValue: mockSpacesService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile()

    controller = module.get<SpacesController>(SpacesController)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('create', () => {
    it('should create a new space', async () => {
      const user = {
        userId: 1,
        email: 'test@test.com',
        sub: 1,
        cedula: '123',
        role: 'user',
      }

      const createSpaceDto: any = {
        name: 'Teatro Nacional',
        type: SpaceTypeEnum.THEATER,
        province: 'Pichincha',
        city: 'Quito',
        address: 'Calle Venezuela',
        email: 'contacto@teatro.ec',
        phone: '022951661',
        coordinates: [-0.2182, -78.5126],
        description: 'Teatro principal',
        target: 'Público general',
        managerName: 'María González',
        managerPhone: '0987654321',
        managerEmail: 'admin@teatro.ec',
        technicianInCharge: 'Carlos Mendoza',
        technicianRole: 'Técnico',
        technicianPhone: '0991234567',
        technicianEmail: 'tecnico@teatro.ec',
        capacity: 850,
        projectionEquipment: ['Proyector 4K'],
        soundEquipment: ['Dolby Atmos'],
        screen: ['Pantalla 20x10m'],
        boxofficeRegistration: 'Sistema digital',
        accessibilities: ['Rampa de acceso'],
        services: ['wifi'],
        operatingHistory: 'Operando 5 años',
        logoId: 1,
        photosId: [2, 3],
        ciDocument: 4,
        managerDocument: 5,
        serviceBill: 6,
        operatingLicense: 7,
      }

      const expectedSpace = {
        id: 1,
        ...createSpaceDto,
        userId: user.userId,
        status: SpaceStatusEnum.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockSpacesService.validateAssetIds.mockReturnValue(true)
      mockSpacesService.create.mockResolvedValue(expectedSpace)

      const result = await controller.create(user, createSpaceDto)

      expect(mockSpacesService.validateAssetIds).toHaveBeenCalledTimes(3)
      expect(mockSpacesService.validateAssetIds).toHaveBeenCalledWith([
        createSpaceDto.logoId,
      ])
      expect(mockSpacesService.validateAssetIds).toHaveBeenCalledWith(
        createSpaceDto.photosId,
      )
      expect(mockSpacesService.validateAssetIds).toHaveBeenCalledWith([
        createSpaceDto.ciDocument,
        createSpaceDto.managerDocument,
        createSpaceDto.serviceBill,
        createSpaceDto.operatingLicense,
      ])
      expect(mockSpacesService.create).toHaveBeenCalledWith(
        user.userId,
        createSpaceDto,
      )
      expect(result).toEqual(expectedSpace)
    })
  })

  describe('findAll', () => {
    it('should return all spaces with pagination', async () => {
      const queryDto = { page: 1, limit: 10 }

      const expectedResult = {
        data: [
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
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      }

      mockSpacesService.findAll.mockResolvedValue(expectedResult)

      const result = await controller.findAll(queryDto)

      expect(mockSpacesService.findAll).toHaveBeenCalledWith(queryDto)
      expect(result).toEqual(expectedResult)
    })
  })

  describe('findMySpaces', () => {
    it('should return user spaces', async () => {
      const user = {
        userId: 1,
        email: 'test@test.com',
        sub: 1,
        cedula: '123',
        role: 'user',
      }

      const queryDto = { page: 1, limit: 10 }

      const expectedResult = {
        data: [
          {
            id: 1,
            name: 'Mi Teatro',
            type: SpaceTypeEnum.THEATER,
            province: 'Pichincha',
            city: 'Quito',
            address: 'Calle 1',
            userId: user.userId,
            status: SpaceStatusEnum.PENDING,
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      }

      mockSpacesService.findMySpaces.mockResolvedValue(expectedResult)

      const result = await controller.findMySpaces(user, queryDto)

      expect(mockSpacesService.findMySpaces).toHaveBeenCalledWith(
        user.userId,
        queryDto,
      )
      expect(result).toEqual(expectedResult)
    })
  })

  describe('findOne', () => {
    it('should return a space by id', async () => {
      const spaceId = 1

      const expectedSpace = {
        id: spaceId,
        name: 'Teatro Nacional',
        type: SpaceTypeEnum.THEATER,
        province: 'Pichincha',
        city: 'Quito',
        address: 'Calle Venezuela',
        userId: 1,
        status: SpaceStatusEnum.ACTIVE,
      }

      mockSpacesService.findOne.mockResolvedValue(expectedSpace)

      const result = await controller.findOne(spaceId)

      expect(mockSpacesService.findOne).toHaveBeenCalledWith(spaceId)
      expect(result).toEqual(expectedSpace)
    })
  })

  describe('update', () => {
    it('should update a space', async () => {
      const spaceId = 1
      const user = {
        userId: 1,
        email: 'test@test.com',
        sub: 1,
        cedula: '123',
        role: 'user',
      }

      const updateSpaceDto = {
        name: 'Teatro Actualizado',
        capacity: 900,
      }

      const expectedSpace = {
        id: spaceId,
        name: updateSpaceDto.name,
        capacity: updateSpaceDto.capacity,
        type: SpaceTypeEnum.THEATER,
        province: 'Pichincha',
        city: 'Quito',
        address: 'Calle Venezuela',
        userId: user.userId,
        status: SpaceStatusEnum.ACTIVE,
      }

      mockSpacesService.update.mockResolvedValue(expectedSpace)

      const result = await controller.update(spaceId, user, updateSpaceDto)

      expect(mockSpacesService.update).toHaveBeenCalledWith(
        spaceId,
        user.userId,
        updateSpaceDto,
      )
      expect(result).toEqual(expectedSpace)
    })
  })

  describe('remove', () => {
    it('should remove a space', async () => {
      const spaceId = 1
      const user = {
        userId: 1,
        email: 'test@test.com',
        sub: 1,
        cedula: '123',
        role: 'user',
      }

      mockSpacesService.remove.mockResolvedValue(undefined)

      const result = await controller.remove(spaceId, user)

      expect(mockSpacesService.remove).toHaveBeenCalledWith(
        spaceId,
        user.userId,
      )
      expect(result).toEqual({ message: 'Espacio eliminado correctamente' })
    })
  })

  describe('updateStatus', () => {
    it('should update space status', async () => {
      const spaceId = 1
      const newStatus = SpaceStatusEnum.VERIFIED

      const expectedSpace = {
        id: spaceId,
        name: 'Teatro Nacional',
        type: SpaceTypeEnum.THEATER,
        province: 'Pichincha',
        city: 'Quito',
        address: 'Calle Venezuela',
        userId: 1,
        status: newStatus,
      }

      mockSpacesService.updateStatus.mockResolvedValue(expectedSpace)

      const result = await controller.updateStatus(spaceId, newStatus)

      expect(mockSpacesService.updateStatus).toHaveBeenCalledWith(
        spaceId,
        newStatus,
      )
      expect(result).toEqual(expectedSpace)
    })
  })
})
