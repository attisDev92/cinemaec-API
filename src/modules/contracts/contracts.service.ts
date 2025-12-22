import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Contract } from './entities/contract.entity'
import { CreateContractDto } from './dto/create-contract.dto'
import { UpdateContractDto } from './dto/update-contract.dto'
import { SpacesService } from '../spaces/spaces.service'

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(Contract)
    private contractsRepository: Repository<Contract>,
    private spacesService: SpacesService,
  ) {}

  /**
   * Crea un nuevo contrato
   */
  async create(
    userId: number,
    createContractDto: CreateContractDto,
  ): Promise<Contract> {
    const now = new Date()

    // Verificar que el espacio existe
    const space = await this.spacesService.findOne(createContractDto.spaceId)

    // Si no se especifica startDate, usar la fecha actual
    const startDate = createContractDto.startDate
      ? new Date(createContractDto.startDate)
      : now

    // Si no se especifica expirationDate, calcular 12 meses desde startDate
    let expirationDate: Date
    if (createContractDto.expirationDate) {
      expirationDate = new Date(createContractDto.expirationDate)
    } else {
      expirationDate = new Date(startDate)
      expirationDate.setMonth(expirationDate.getMonth() + 12)
    }

    // Validar que expirationDate sea posterior a startDate
    if (expirationDate <= startDate) {
      throw new BadRequestException(
        'La fecha de expiración debe ser posterior a la fecha de inicio',
      )
    }

    const contract = this.contractsRepository.create({
      userId,
      adminName: createContractDto.adminName,
      spaceId: createContractDto.spaceId,
      contractType: createContractDto.contractType,
      documentUrl: createContractDto.documentUrl,
      startDate,
      expirationDate,
    })

    const savedContract = await this.contractsRepository.save(contract)

    // Actualizar el contractId y cambiar el estado del espacio a UNDER_REVIEW
    await this.spacesService.updateContractId(space.id, savedContract.id)
    await this.spacesService.updateSpaceStatus(space.id, 'under_review')

    return savedContract
  }

  /**
   * Obtiene todos los contratos con filtros opcionales
   */
  async findAll(userId?: number): Promise<Contract[]> {
    const query = this.contractsRepository
      .createQueryBuilder('contract')
      .leftJoinAndSelect('contract.user', 'user')

    if (userId) {
      query.andWhere('contract.userId = :userId', { userId })
    }

    query.orderBy('contract.createdAt', 'DESC')

    return await query.getMany()
  }

  /**
   * Obtiene un contrato por su ID
   */
  async findOne(id: number): Promise<Contract> {
    const contract = await this.contractsRepository.findOne({
      where: { id },
      relations: ['user'],
    })

    if (!contract) {
      throw new NotFoundException(`Contrato con ID ${id} no encontrado`)
    }

    return contract
  }

  /**
   * Actualiza un contrato existente
   */
  async update(
    id: number,
    updateContractDto: UpdateContractDto,
  ): Promise<Contract> {
    const contract = await this.findOne(id)

    // Actualizar campos si están presentes
    if (updateContractDto.adminName !== undefined) {
      contract.adminName = updateContractDto.adminName
    }

    if (updateContractDto.contractType !== undefined) {
      contract.contractType = updateContractDto.contractType
    }

    if (updateContractDto.documentUrl !== undefined) {
      contract.documentUrl = updateContractDto.documentUrl
    }

    if (updateContractDto.startDate !== undefined) {
      contract.startDate = new Date(updateContractDto.startDate)
    }

    if (updateContractDto.expirationDate !== undefined) {
      contract.expirationDate = new Date(updateContractDto.expirationDate)
    }

    // Validar fechas
    if (contract.expirationDate <= contract.startDate) {
      throw new BadRequestException(
        'La fecha de expiración debe ser posterior a la fecha de inicio',
      )
    }

    return await this.contractsRepository.save(contract)
  }

  /**
   * Elimina un contrato
   */
  async remove(id: number): Promise<void> {
    const contract = await this.findOne(id)
    await this.contractsRepository.remove(contract)
  }

  /**
   * Obtiene contratos que están por vencer (próximos 30 días)
   */
  async findExpiringSoon(): Promise<Contract[]> {
    const now = new Date()
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    return await this.contractsRepository
      .createQueryBuilder('contract')
      .leftJoinAndSelect('contract.user', 'user')
      .where('contract.expirationDate BETWEEN :now AND :thirtyDaysFromNow', {
        now,
        thirtyDaysFromNow,
      })
      .orderBy('contract.expirationDate', 'ASC')
      .getMany()
  }

  /**
   * Obtiene contratos expirados
   */
  async findExpired(): Promise<Contract[]> {
    const now = new Date()

    return await this.contractsRepository
      .createQueryBuilder('contract')
      .leftJoinAndSelect('contract.user', 'user')
      .where('contract.expirationDate < :now', { now })
      .orderBy('contract.expirationDate', 'DESC')
      .getMany()
  }
}
