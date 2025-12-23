import { Test, TestingModule } from '@nestjs/testing'
import { ContractsService } from './contracts.service'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Contract, ContractTypeEnum } from './entities/contract.entity'
import { NotFoundException, BadRequestException } from '@nestjs/common'
import { SpacesService } from '../spaces/spaces.service'

describe('ContractsService', () => {
  let service: ContractsService

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  }

  const mockSpacesService = {
    findOne: jest.fn(),
    updateContractId: jest.fn(),
    updateSpaceStatus: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContractsService,
        {
          provide: getRepositoryToken(Contract),
          useValue: mockRepository,
        },
        {
          provide: SpacesService,
          useValue: mockSpacesService,
        },
      ],
    }).compile()

    service = module.get<ContractsService>(ContractsService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('should create a contract with default dates', async () => {
      const createDto = {
        adminName: 'Juan Pérez',
        spaceId: 10,
        contractType: ContractTypeEnum.SPACE,
        documentUrl: 'https://example.com/contract.pdf',
      }

      const mockSpace = { id: 10, name: 'Test Space' }
      const mockContract = {
        id: 1,
        userId: 2,
        ...createDto,
        startDate: new Date(),
        expirationDate: new Date(),
      }

      mockSpacesService.findOne.mockResolvedValue(mockSpace)
      mockRepository.create.mockReturnValue(mockContract)
      mockRepository.save.mockResolvedValue(mockContract)
      mockSpacesService.updateContractId.mockResolvedValue(mockSpace)

      const result = await service.create(2, createDto)

      expect(result).toEqual(mockContract)
      expect(mockSpacesService.findOne).toHaveBeenCalledWith(10)
      expect(mockSpacesService.updateContractId).toHaveBeenCalledWith(10, 1)
      expect(mockRepository.create).toHaveBeenCalled()
      expect(mockRepository.save).toHaveBeenCalledWith(mockContract)
    })

    it('should create a contract with custom dates', async () => {
      const startDate = '2025-01-01T00:00:00Z'
      const expirationDate = '2026-01-01T00:00:00Z'

      const createDto = {
        adminName: 'Juan Pérez',
        spaceId: 10,
        contractType: ContractTypeEnum.SPACE,
        documentUrl: 'https://example.com/contract.pdf',
        startDate,
        expirationDate,
      }

      const mockSpace = { id: 10, name: 'Test Space' }
      const mockContract = {
        id: 1,
        userId: 2,
        adminName: 'Juan Pérez',
        spaceId: 10,
        contractType: ContractTypeEnum.SPACE,
        documentUrl: 'https://example.com/contract.pdf',
        startDate: new Date(startDate),
        expirationDate: new Date(expirationDate),
      }

      mockSpacesService.findOne.mockResolvedValue(mockSpace)
      mockRepository.create.mockReturnValue(mockContract)
      mockRepository.save.mockResolvedValue(mockContract)
      mockSpacesService.updateContractId.mockResolvedValue(mockSpace)

      const result = await service.create(2, createDto)

      expect(result).toEqual(mockContract)
    })

    it('should throw error if expirationDate is before startDate', async () => {
      const createDto = {
        adminName: 'Juan Pérez',
        spaceId: 10,
        contractType: ContractTypeEnum.SPACE,
        documentUrl: 'https://example.com/contract.pdf',
        startDate: '2026-01-01T00:00:00Z',
        expirationDate: '2025-01-01T00:00:00Z',
      }

      const mockSpace = { id: 10, name: 'Test Space' }
      mockSpacesService.findOne.mockResolvedValue(mockSpace)

      await expect(service.create(2, createDto)).rejects.toThrow(
        BadRequestException,
      )
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
      }

      mockRepository.findOne.mockResolvedValue(mockContract)

      const result = await service.findOne(1)

      expect(result).toEqual(mockContract)
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['user'],
      })
    })

    it('should throw NotFoundException if contract not found', async () => {
      mockRepository.findOne.mockResolvedValue(null)

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException)
    })
  })

  describe('update', () => {
    it('should update a contract', async () => {
      const mockContract = {
        id: 1,
        userId: 2,
        adminName: 'Juan Pérez',
        contractType: ContractTypeEnum.SPACE,
        documentUrl: 'https://example.com/contract.pdf',
        startDate: new Date('2025-01-01'),
        expirationDate: new Date('2026-01-01'),
      }

      const updateDto = {
        documentUrl: 'https://example.com/new-contract.pdf',
      }

      mockRepository.findOne.mockResolvedValue(mockContract)
      mockRepository.save.mockResolvedValue({
        ...mockContract,
        ...updateDto,
      })

      const result = await service.update(1, updateDto)

      expect(result.documentUrl).toBe(updateDto.documentUrl)
      expect(mockRepository.save).toHaveBeenCalled()
    })
  })

  describe('remove', () => {
    it('should remove a contract', async () => {
      const mockContract = {
        id: 1,
        userId: 2,
        adminName: 'Juan Pérez',
        contractType: ContractTypeEnum.SPACE,
        documentUrl: 'https://example.com/contract.pdf',
        startDate: new Date(),
        expirationDate: new Date(),
      }

      mockRepository.findOne.mockResolvedValue(mockContract)
      mockRepository.remove.mockResolvedValue(mockContract)

      await service.remove(1)

      expect(mockRepository.remove).toHaveBeenCalledWith(mockContract)
    })
  })
})
