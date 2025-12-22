import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { AssetsService } from './assets.service'
import { Asset, AssetTypeEnum, AssetOwnerEnum } from './entities/asset.entity'
import { FirebaseService } from './services/firebase.service'

describe('AssetsService', () => {
  let service: AssetsService

  const mockAssetsRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  }

  const mockFirebaseService = {
    uploadFile: jest.fn(),
    deleteFile: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssetsService,
        {
          provide: getRepositoryToken(Asset),
          useValue: mockAssetsRepository,
        },
        {
          provide: FirebaseService,
          useValue: mockFirebaseService,
        },
      ],
    }).compile()

    service = module.get<AssetsService>(AssetsService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('uploadAsset', () => {
    const userId = 1
    const file = {
      originalname: 'test-image.jpg',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('test'),
      size: 1024,
    } as Express.Multer.File

    const uploadAssetDto: any = {
      documentType: AssetTypeEnum.IMAGE,
      ownerType: AssetOwnerEnum.COMPANY_LOGO,
      ownerId: 5,
    }

    it('should upload asset successfully', async () => {
      const firebaseResponse = {
        url: 'https://storage.googleapis.com/bucket/path/file.jpg',
        fullPath: 'company_logo/5/123456_test-image.jpg',
      }

      const savedAsset = {
        id: 1,
        userId,
        documentType: uploadAssetDto.documentType,
        ownerType: uploadAssetDto.ownerType,
        ownerId: uploadAssetDto.ownerId,
        url: firebaseResponse.url,
        firebasePath: firebaseResponse.fullPath,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockFirebaseService.uploadFile.mockResolvedValue(firebaseResponse)
      mockAssetsRepository.create.mockReturnValue(savedAsset)
      mockAssetsRepository.save.mockResolvedValue(savedAsset)

      const result = await service.uploadAsset(userId, file, uploadAssetDto)

      expect(mockFirebaseService.uploadFile).toHaveBeenCalledWith(
        file,
        'company_logo/5',
      )
      expect(mockAssetsRepository.create).toHaveBeenCalledWith({
        userId,
        documentType: uploadAssetDto.documentType,
        ownerType: uploadAssetDto.ownerType,
        ownerId: uploadAssetDto.ownerId,
        url: firebaseResponse.url,
        firebasePath: firebaseResponse.fullPath,
      })
      expect(result).toEqual(savedAsset)
    })

    it('should throw BadRequestException if no file provided', async () => {
      await expect(
        service.uploadAsset(userId, null as any, uploadAssetDto),
      ).rejects.toThrow(BadRequestException)

      expect(mockFirebaseService.uploadFile).not.toHaveBeenCalled()
      expect(mockAssetsRepository.create).not.toHaveBeenCalled()
    })

    it('should handle upload without ownerId', async () => {
      const dtoWithoutOwnerId = {
        documentType: AssetTypeEnum.IMAGE,
        ownerType: AssetOwnerEnum.SPACE_LOGO,
      }

      const firebaseResponse = {
        url: 'https://storage.googleapis.com/bucket/path/file.jpg',
        fullPath: 'space_logo/123456_test-image.jpg',
      }

      mockFirebaseService.uploadFile.mockResolvedValue(firebaseResponse)
      mockAssetsRepository.create.mockReturnValue({})
      mockAssetsRepository.save.mockResolvedValue({})

      await service.uploadAsset(userId, file, dtoWithoutOwnerId as any)

      expect(mockFirebaseService.uploadFile).toHaveBeenCalledWith(
        file,
        'space_logo',
      )
    })
  })

  describe('findAll', () => {
    it('should return filtered assets', async () => {
      const assets = [
        {
          id: 1,
          userId: 1,
          documentType: AssetTypeEnum.IMAGE,
          ownerType: AssetOwnerEnum.COMPANY_LOGO,
          ownerId: 5,
          url: 'https://example.com/image.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(assets),
      }

      mockAssetsRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder)

      const queryDto = {
        documentType: AssetTypeEnum.IMAGE,
        ownerType: AssetOwnerEnum.COMPANY_LOGO,
        ownerId: 5,
      }

      const result = await service.findAll(queryDto, 1)

      expect(mockAssetsRepository.createQueryBuilder).toHaveBeenCalledWith(
        'asset',
      )
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'asset.userId = :userId',
        { userId: 1 },
      )
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'asset.documentType = :documentType',
        { documentType: AssetTypeEnum.IMAGE },
      )
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'asset.createdAt',
        'DESC',
      )
      expect(result).toEqual(assets)
    })

    it('should return all assets without filters', async () => {
      const assets = [{ id: 1 }, { id: 2 }]

      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(assets),
      }

      mockAssetsRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder)

      const result = await service.findAll({})

      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled()
      expect(result).toEqual(assets)
    })
  })

  describe('findOne', () => {
    it('should return an asset by id', async () => {
      const asset = {
        id: 1,
        userId: 1,
        documentType: AssetTypeEnum.IMAGE,
        ownerType: AssetOwnerEnum.COMPANY_LOGO,
        url: 'https://example.com/image.jpg',
      }

      mockAssetsRepository.findOne.mockResolvedValue(asset)

      const result = await service.findOne(1)

      expect(mockAssetsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      })
      expect(result).toEqual(asset)
    })

    it('should throw NotFoundException if asset not found', async () => {
      mockAssetsRepository.findOne.mockResolvedValue(null)

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException)
      expect(mockAssetsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
      })
    })
  })

  describe('replaceAsset', () => {
    const assetId = 1
    const userId = 1
    const file = {
      originalname: 'new-image.jpg',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('test'),
    } as Express.Multer.File

    it('should replace asset successfully', async () => {
      const existingAsset = {
        id: assetId,
        userId: 1,
        documentType: AssetTypeEnum.IMAGE,
        ownerType: AssetOwnerEnum.COMPANY_LOGO,
        ownerId: 5,
        url: 'https://old-url.com/old.jpg',
        firebasePath: 'old/path/file.jpg',
      }

      const firebaseResponse = {
        url: 'https://new-url.com/new.jpg',
        fullPath: 'company_logo/5/new-file.jpg',
      }

      const updatedAsset = {
        ...existingAsset,
        url: firebaseResponse.url,
        firebasePath: firebaseResponse.fullPath,
        userId,
      }

      mockAssetsRepository.findOne.mockResolvedValue(existingAsset)
      mockFirebaseService.deleteFile.mockResolvedValue(undefined)
      mockFirebaseService.uploadFile.mockResolvedValue(firebaseResponse)
      mockAssetsRepository.save.mockResolvedValue(updatedAsset)

      const result = await service.replaceAsset(assetId, userId, file)

      expect(mockFirebaseService.deleteFile).toHaveBeenCalled()
      expect(mockFirebaseService.uploadFile).toHaveBeenCalledWith(
        file,
        'company_logo/5',
      )
      expect(mockAssetsRepository.save).toHaveBeenCalledWith(updatedAsset)
      expect(result).toEqual(updatedAsset)
    })

    it('should throw BadRequestException if no file provided', async () => {
      await expect(
        service.replaceAsset(assetId, userId, null as any),
      ).rejects.toThrow(BadRequestException)

      expect(mockAssetsRepository.findOne).not.toHaveBeenCalled()
    })

    it('should throw NotFoundException if asset not found', async () => {
      mockAssetsRepository.findOne.mockResolvedValue(null)

      await expect(service.replaceAsset(999, userId, file)).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('remove', () => {
    it('should remove asset successfully', async () => {
      const asset = {
        id: 1,
        userId: 1,
        documentType: AssetTypeEnum.IMAGE,
        ownerType: AssetOwnerEnum.COMPANY_LOGO,
        url: 'https://example.com/image.jpg',
        firebasePath: 'company_logo/file.jpg',
      }

      mockAssetsRepository.findOne.mockResolvedValue(asset)
      mockFirebaseService.deleteFile.mockResolvedValue(undefined)
      mockAssetsRepository.remove.mockResolvedValue(asset)

      await service.remove(1)

      expect(mockFirebaseService.deleteFile).toHaveBeenCalledWith(
        asset.firebasePath,
      )
      expect(mockAssetsRepository.remove).toHaveBeenCalledWith(asset)
    })

    it('should throw NotFoundException if asset not found', async () => {
      mockAssetsRepository.findOne.mockResolvedValue(null)

      await expect(service.remove(999)).rejects.toThrow(NotFoundException)
      expect(mockFirebaseService.deleteFile).not.toHaveBeenCalled()
      expect(mockAssetsRepository.remove).not.toHaveBeenCalled()
    })

    it('should handle asset without firebasePath', async () => {
      const asset = {
        id: 1,
        userId: 1,
        documentType: AssetTypeEnum.IMAGE,
        ownerType: AssetOwnerEnum.COMPANY_LOGO,
        url: 'https://example.com/image.jpg',
        firebasePath: null,
      }

      mockAssetsRepository.findOne.mockResolvedValue(asset)
      mockAssetsRepository.remove.mockResolvedValue(asset)

      await service.remove(1)

      expect(mockFirebaseService.deleteFile).not.toHaveBeenCalled()
      expect(mockAssetsRepository.remove).toHaveBeenCalledWith(asset)
    })
  })
})
