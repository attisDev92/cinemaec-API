import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger'
import { ContractsService } from './contracts.service'
import { CreateContractDto } from './dto/create-contract.dto'
import { UpdateContractDto } from './dto/update-contract.dto'
import { Contract } from './entities/contract.entity'
import { JwtAuthGuard } from '../users/guards/jwt-auth.guard'
import {
  CurrentUser,
  JwtPayload,
} from '../users/decorators/current-user.decorator'

@ApiTags('Contracts')
@Controller('contracts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  /**
   * Crear un nuevo contrato
   */
  @Post()
  @ApiOperation({ summary: 'Crear un nuevo contrato' })
  @ApiResponse({
    status: 201,
    description: 'Contrato creado exitosamente',
    type: Contract,
  })
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() createContractDto: CreateContractDto,
  ): Promise<Contract> {
    return this.contractsService.create(user.userId, createContractDto)
  }

  /**
   * Obtener todos los contratos
   */
  @Get()
  @ApiOperation({ summary: 'Obtener todos los contratos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de contratos',
    type: [Contract],
  })
  async findAll(@CurrentUser() user: JwtPayload): Promise<Contract[]> {
    // Los usuarios normales solo ven sus propios contratos
    // Los admins pueden ver todos (agregar lógica de roles si es necesario)
    return this.contractsService.findAll(user.userId)
  }

  /**
   * Obtener contratos que están por vencer
   */
  @Get('expiring-soon')
  @ApiOperation({
    summary: 'Obtener contratos que vencen en los próximos 30 días',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de contratos próximos a vencer',
    type: [Contract],
  })
  async findExpiringSoon(): Promise<Contract[]> {
    return this.contractsService.findExpiringSoon()
  }

  /**
   * Obtener contratos expirados
   */
  @Get('expired')
  @ApiOperation({ summary: 'Obtener contratos expirados' })
  @ApiResponse({
    status: 200,
    description: 'Lista de contratos expirados',
    type: [Contract],
  })
  async findExpired(): Promise<Contract[]> {
    return this.contractsService.findExpired()
  }

  /**
   * Obtener un contrato por ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un contrato por ID' })
  @ApiResponse({
    status: 200,
    description: 'Contrato encontrado',
    type: Contract,
  })
  @ApiResponse({ status: 404, description: 'Contrato no encontrado' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Contract> {
    return this.contractsService.findOne(id)
  }

  /**
   * Actualizar un contrato
   */
  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un contrato' })
  @ApiResponse({
    status: 200,
    description: 'Contrato actualizado',
    type: Contract,
  })
  @ApiResponse({ status: 404, description: 'Contrato no encontrado' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateContractDto: UpdateContractDto,
  ): Promise<Contract> {
    return this.contractsService.update(id, updateContractDto)
  }

  /**
   * Eliminar un contrato
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un contrato' })
  @ApiResponse({ status: 200, description: 'Contrato eliminado' })
  @ApiResponse({ status: 404, description: 'Contrato no encontrado' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.contractsService.remove(id)
  }
}
