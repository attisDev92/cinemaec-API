import { Test, TestingModule } from '@nestjs/testing'
import { ContractsController } from './contracts.controller'
import { ContractsService } from './contracts.service'
import { ContractTypeEnum } from './entities/contract.entity'

describe('ContractsController', () => {
  let controller: ContractsController
  let service: ContractsService

  const mockContractsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findExpiringSoon: jest.fn(),
    findExpired: jest.fn(),
  }

  const mockUser = {
    userId: 2,
    sub: 2,
    email: 'test@example.com',
    cedula: '1234567890',
    role: 'user',
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContractsController],
      providers: [
        {
          provide: ContractsService,
          useValue: mockContractsService,
        },
      ],
    }).compile()

    controller = module.get<ContractsController>(ContractsController)
    service = module.get<ContractsService>(ContractsService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('create', () => {
    it('should create a contract', async () => {
      const createDto = {
        adminName: 'Juan Pérez',
        spaceId: 10,
        contractType: ContractTypeEnum.SPACE,
        documentUrl: 'https://example.com/contract.pdf',
      }

      const mockContract = {
        id: 1,
        userId: 2,
        ...createDto,
        startDate: new Date(),
        expirationDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockContractsService.create.mockResolvedValue(mockContract)

      const result = await controller.create(mockUser, createDto)

      expect(result).toEqual(mockContract)
      expect(service.create).toHaveBeenCalledWith(mockUser.userId, createDto)
    })
  })

  describe('findAll', () => {
    it('should return an array of contracts', async () => {
      const mockContracts = [
        {
          id: 1,
          userId: 2,
          adminName: 'Juan Pérez',
          contractType: ContractTypeEnum.SPACE,
          documentUrl: 'https://example.com/contract.pdf',
          startDate: new Date(),
          expirationDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockContractsService.findAll.mockResolvedValue(mockContracts)

      const result = await controller.findAll(mockUser)

      expect(result).toEqual(mockContracts)
      expect(service.findAll).toHaveBeenCalledWith(mockUser.userId)
    })
  })

  describe('findOne', () => {
    it('should return a contract by id', async () => {
      const mockContract = {
        id: 1,
        userId: 2,
        adminName: 'Juan Pérez',
        contractType: ContractTypeEnum.SPACE,
        documentUrl: 'https://example.com/contract.pdf',
        startDate: new Date(),
        expirationDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockContractsService.findOne.mockResolvedValue(mockContract)

      const result = await controller.findOne(1)

      expect(result).toEqual(mockContract)
      expect(service.findOne).toHaveBeenCalledWith(1)
    })
  })

  describe('update', () => {
    it('should update a contract', async () => {
      const updateDto = {
        documentUrl: 'https://example.com/new-contract.pdf',
      }

      const mockContract = {
        id: 1,
        userId: 2,
        adminName: 'Juan Pérez',
        contractType: ContractTypeEnum.SPACE,
        documentUrl: 'https://example.com/new-contract.pdf',
        startDate: new Date(),
        expirationDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockContractsService.update.mockResolvedValue(mockContract)

      const result = await controller.update(1, updateDto)

      expect(result).toEqual(mockContract)
      expect(service.update).toHaveBeenCalledWith(1, updateDto)
    })
  })

  describe('remove', () => {
    it('should remove a contract', async () => {
      mockContractsService.remove.mockResolvedValue(undefined)

      await controller.remove(1)

      expect(service.remove).toHaveBeenCalledWith(1)
    })
  })

  describe('findExpiringSoon', () => {
    it('should return contracts expiring soon', async () => {
      const mockContracts = [
        {
          id: 1,
          userId: 2,
          adminName: 'Juan Pérez',
          contractType: ContractTypeEnum.SPACE,
          documentUrl: 'https://example.com/contract.pdf',
          startDate: new Date(),
          expirationDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockContractsService.findExpiringSoon.mockResolvedValue(mockContracts)

      const result = await controller.findExpiringSoon()

      expect(result).toEqual(mockContracts)
      expect(service.findExpiringSoon).toHaveBeenCalled()
    })
  })

  describe('findExpired', () => {
    it('should return expired contracts', async () => {
      const mockContracts = [
        {
          id: 1,
          userId: 2,
          adminName: 'Juan Pérez',
          contractType: ContractTypeEnum.SPACE,
          documentUrl: 'https://example.com/contract.pdf',
          startDate: new Date(),
          expirationDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockContractsService.findExpired.mockResolvedValue(mockContracts)

      const result = await controller.findExpired()

      expect(result).toEqual(mockContracts)
      expect(service.findExpired).toHaveBeenCalled()
    })
  })
})
