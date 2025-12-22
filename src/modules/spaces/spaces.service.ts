import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Space } from './entities/space.entity'
import { CreateSpaceDto } from './dto/create-space.dto'
import { UpdateSpaceDto } from './dto/update-space.dto'
import { QuerySpacesDto } from './dto/query-spaces.dto'
import { AssetsService } from '../assets/assets.service'

@Injectable()
export class SpacesService {
  constructor(
    @InjectRepository(Space)
    private spacesRepository: Repository<Space>,
    private assetsService: AssetsService,
  ) {}

  /**
   * Crear un nuevo espacio
   */
  async create(userId: number, createSpaceDto: CreateSpaceDto): Promise<Space> {
    const space = this.spacesRepository.create({
      ...createSpaceDto,
      userId,
    })

    const savedSpace = await this.spacesRepository.save(space)

    // Actualizar ownerId de todos los assets asociados
    const assetIds = [
      createSpaceDto.logoId,
      ...createSpaceDto.photosId,
      createSpaceDto.ciDocument,
      createSpaceDto.managerDocument,
      createSpaceDto.serviceBill,
      createSpaceDto.operatingLicense,
    ]

    // Agregar rucDocument si existe
    if (createSpaceDto.rucDocument) {
      assetIds.push(createSpaceDto.rucDocument)
    }

    // Actualizar ownerId de todos los assets
    try {
      await this.assetsService.updateMultipleAssetsOwner(
        assetIds,
        savedSpace.id,
        userId,
      )
    } catch (error) {
      // Si falla la actualización de assets, no revertir la creación del espacio
      console.error('Error actualizando ownerId de assets:', error)
    }

    return savedSpace
  }

  /**
   * Obtener todos los espacios con filtros y paginación
   */
  async findAll(queryDto: QuerySpacesDto): Promise<{
    data: Space[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    const { page = 1, limit = 10, ...filters } = queryDto

    const queryBuilder = this.spacesRepository.createQueryBuilder('space')

    // Aplicar filtros
    if (filters.type) {
      queryBuilder.andWhere('space.type = :type', { type: filters.type })
    }

    if (filters.status) {
      queryBuilder.andWhere('space.status = :status', {
        status: filters.status,
      })
    }

    if (filters.province) {
      queryBuilder.andWhere('space.province = :province', {
        province: filters.province,
      })
    }

    if (filters.city) {
      queryBuilder.andWhere('space.city = :city', { city: filters.city })
    }

    if (filters.name) {
      queryBuilder.andWhere('space.name ILIKE :name', {
        name: `%${filters.name}%`,
      })
    }

    if (filters.userId) {
      queryBuilder.andWhere('space.userId = :userId', {
        userId: filters.userId,
      })
    }

    // Paginación
    const skip = (page - 1) * limit
    queryBuilder.skip(skip).take(limit)

    // Ordenar por fecha de creación (más recientes primero)
    queryBuilder.orderBy('space.createdAt', 'DESC')

    // Ejecutar consulta
    const [data, total] = await queryBuilder.getManyAndCount()

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  /**
   * Obtener espacios del usuario autenticado
   */
  async findMySpaces(
    userId: number,
    queryDto: QuerySpacesDto,
  ): Promise<{
    data: Space[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    return this.findAll({ ...queryDto, userId })
  }

  /**
   * Obtener un espacio por ID
   */
  async findOne(id: number): Promise<Space> {
    const space = await this.spacesRepository.findOne({ where: { id } })

    if (!space) {
      throw new NotFoundException(`Espacio con ID ${id} no encontrado`)
    }

    return space
  }

  /**
   * Actualizar un espacio
   * Solo el propietario puede actualizar su espacio
   */
  async update(
    id: number,
    userId: number,
    updateSpaceDto: UpdateSpaceDto,
  ): Promise<Space> {
    const space = await this.findOne(id)

    // Verificar que el usuario sea el propietario
    if (space.userId !== userId) {
      throw new ForbiddenException(
        'No tienes permisos para actualizar este espacio',
      )
    }

    // Actualizar los campos
    Object.assign(space, updateSpaceDto)

    return await this.spacesRepository.save(space)
  }

  /**
   * Eliminar un espacio
   * Solo el propietario puede eliminar su espacio
   */
  async remove(id: number, userId: number): Promise<void> {
    const space = await this.findOne(id)

    // Verificar que el usuario sea el propietario
    if (space.userId !== userId) {
      throw new ForbiddenException(
        'No tienes permisos para eliminar este espacio',
      )
    }

    await this.spacesRepository.remove(space)
  }

  /**
   * Cambiar el estado de un espacio (para administradores)
   */
  async updateStatus(id: number, status: string): Promise<Space> {
    const space = await this.findOne(id)

    space.status = status as any

    return await this.spacesRepository.save(space)
  }

  /**
   * Validar que los IDs de assets existan
   * Esta función puede ser llamada antes de crear/actualizar para validar
   */
  validateAssetIds(assetIds: number[]): boolean {
    // Aquí podrías hacer una consulta a la tabla assets si necesitas validación estricta
    // Por ahora, solo verificamos que sean números válidos
    if (!assetIds || assetIds.length === 0) {
      return true
    }

    const areValidIds = assetIds.every((id) => Number.isInteger(id) && id > 0)

    if (!areValidIds) {
      throw new BadRequestException(
        'Los IDs de assets deben ser enteros positivos',
      )
    }

    return true
  }

  /**
   * Actualizar el contractId de un espacio
   */
  async updateContractId(spaceId: number, contractId: number): Promise<Space> {
    const space = await this.findOne(spaceId)
    space.contractId = contractId
    return await this.spacesRepository.save(space)
  }

  /**
   * Actualizar el estado de un espacio
   */
  async updateSpaceStatus(
    spaceId: number,
    status:
      | 'pending'
      | 'verified'
      | 'rejected'
      | 'active'
      | 'inactive'
      | 'under_review',
  ): Promise<Space> {
    const space = await this.findOne(spaceId)
    space.status = status as any
    return await this.spacesRepository.save(space)
  }
}
