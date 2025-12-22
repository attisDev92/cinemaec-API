import { Test, TestingModule } from '@nestjs/testing'
import { AssetsController } from './assets.controller'
import { AssetsService } from './assets.service'
import { AssetTypeEnum, AssetOwnerEnum } from './entities/asset.entity'
import { JwtAuthGuard } from '../users/guards/jwt-auth.guard'

describe('AssetsController', () => {
  let controller: AssetsController
  let service: AssetsService

  const mockAssetsService = {
    uploadAsset: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    replaceAsset: jest.fn(),
    remove: jest.fn(),
  }

  const mockJwtAuthGuard = {
    canActivate: jest.fn(() => true),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssetsController],
      providers: [
        {
          provide: AssetsService,
          useValue: mockAssetsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile()

    controller = module.get<AssetsController>(AssetsController)
    service = module.get<AssetsService>(AssetsService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('uploadAsset', () => {
    it('should upload an asset', async () => {
      const user = {
        userId: 1,
        email: 'test@test.com',
        sub: 1,
        cedula: '123',
        role: 'user',
      }
      const file = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test'),
      } as Express.Multer.File

      const documentType = 'image'
      const ownerType = 'company_logo'
      const ownerId = '5'

      const expectedResult = {
        id: 1,
        userId: 1,
        documentType: AssetTypeEnum.IMAGE,
        ownerType: AssetOwnerEnum.COMPANY_LOGO,
        ownerId: 5,
        url: 'https://storage.googleapis.com/bucket/file.jpg',
        firebasePath: 'company_logo/5/file.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockAssetsService.uploadAsset.mockResolvedValue(expectedResult)

      const result = await controller.uploadAsset(
        user,
        file,
        documentType,
        ownerType,
        ownerId,
      )

      expect(mockAssetsService.uploadAsset).toHaveBeenCalledWith(
        user.userId,
        file,
        expect.objectContaining({
          documentType: AssetTypeEnum.IMAGE,
          ownerType: AssetOwnerEnum.COMPANY_LOGO,
          ownerId: 5,
        }),
      )
      expect(result).toEqual(expectedResult)
    })
  })

  describe('findAll', () => {
    it('should return all assets with filters', async () => {
      const queryDto = {
        documentType: AssetTypeEnum.IMAGE,
        ownerType: AssetOwnerEnum.COMPANY_LOGO,
      }

      const expectedResult = [
        {
          id: 1,
          documentType: AssetTypeEnum.IMAGE,
          ownerType: AssetOwnerEnum.COMPANY_LOGO,
        },
        {
          id: 2,
          documentType: AssetTypeEnum.IMAGE,
          ownerType: AssetOwnerEnum.COMPANY_LOGO,
        },
      ]

      mockAssetsService.findAll.mockResolvedValue(expectedResult)

      const result = await controller.findAll(queryDto)

      expect(service.findAll).toHaveBeenCalledWith(queryDto)
      expect(result).toEqual(expectedResult)
    })
  })

  describe('findMyAssets', () => {
    it('should return user assets', async () => {
      const user = {
        userId: 1,
        email: 'test@test.com',
        sub: 1,
        cedula: '123',
        role: 'user',
      }
      const queryDto = {
        documentType: AssetTypeEnum.IMAGE,
      }

      const expectedResult = [
        {
          id: 1,
          userId: 1,
          documentType: AssetTypeEnum.IMAGE,
        },
      ]

      mockAssetsService.findAll.mockResolvedValue(expectedResult)

      const result = await controller.findMyAssets(user, queryDto)

      expect(service.findAll).toHaveBeenCalledWith(queryDto, user.userId)
      expect(result).toEqual(expectedResult)
    })
  })

  describe('findOne', () => {
    it('should return an asset by id', async () => {
      const assetId = 1
      const expectedResult = {
        id: assetId,
        userId: 1,
        documentType: AssetTypeEnum.IMAGE,
        ownerType: AssetOwnerEnum.COMPANY_LOGO,
        url: 'https://example.com/image.jpg',
      }

      mockAssetsService.findOne.mockResolvedValue(expectedResult)

      const result = await controller.findOne(assetId)

      expect(mockAssetsService.findOne).toHaveBeenCalledWith(assetId)
      expect(result).toEqual(expectedResult)
    })
  })

  describe('replaceAsset', () => {
    it('should replace an asset', async () => {
      const user = {
        userId: 1,
        email: 'test@test.com',
        sub: 1,
        cedula: '123',
        role: 'user',
      }
      const assetId = 1
      const file = {
        originalname: 'new-image.jpg',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test'),
      } as Express.Multer.File

      const expectedResult = {
        id: assetId,
        userId: 1,
        documentType: AssetTypeEnum.IMAGE,
        ownerType: AssetOwnerEnum.COMPANY_LOGO,
        url: 'https://storage.googleapis.com/bucket/new-file.jpg',
        firebasePath: 'assets/company_logo/new-file.jpg',
        updatedAt: new Date(),
      }

      mockAssetsService.replaceAsset.mockResolvedValue(expectedResult)

      const result = await controller.replaceAsset(user, assetId, file)

      expect(mockAssetsService.replaceAsset).toHaveBeenCalledWith(
        assetId,
        user.userId,
        file,
      )
      expect(result).toEqual(expectedResult)
    })
  })

  describe('remove', () => {
    it('should delete an asset', async () => {
      const assetId = 1

      mockAssetsService.remove.mockResolvedValue(undefined)

      const result = await controller.remove(assetId)

      expect(mockAssetsService.remove).toHaveBeenCalledWith(assetId)
      expect(result).toEqual({ message: 'Asset eliminado correctamente' })
    })
  })
})
