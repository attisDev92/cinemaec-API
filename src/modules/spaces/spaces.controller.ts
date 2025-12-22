import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger'
import { SpacesService } from './spaces.service'
import { CreateSpaceDto } from './dto/create-space.dto'
import { UpdateSpaceDto } from './dto/update-space.dto'
import { QuerySpacesDto } from './dto/query-spaces.dto'
import { JwtAuthGuard } from '../users/guards/jwt-auth.guard'
import { CurrentUser } from '../users/decorators/current-user.decorator'

interface JwtPayload {
  sub: number
  email: string
  userId: number
  cedula: string
  role: string
}

@ApiTags('spaces')
@Controller('spaces')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SpacesController {
  constructor(private readonly spacesService: SpacesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear un nuevo espacio',
    description:
      'Crea un nuevo espacio asociado al usuario autenticado. Los campos logoId y photosId deben ser IDs válidos de assets previamente subidos.',
  })
  @ApiResponse({
    status: 201,
    description: 'Espacio creado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() createSpaceDto: CreateSpaceDto,
  ) {
    // Validar IDs de assets (logos, fotos y documentos)
    this.spacesService.validateAssetIds([createSpaceDto.logoId])
    this.spacesService.validateAssetIds(createSpaceDto.photosId)

    // Validar documentos obligatorios
    const requiredDocuments = [
      createSpaceDto.ciDocument,
      createSpaceDto.managerDocument,
      createSpaceDto.serviceBill,
      createSpaceDto.operatingLicense,
    ]
    this.spacesService.validateAssetIds(requiredDocuments)

    // Validar documento RUC si está presente
    if (createSpaceDto.rucDocument) {
      this.spacesService.validateAssetIds([createSpaceDto.rucDocument])
    }

    return this.spacesService.create(user.userId, createSpaceDto)
  }

  @Get()
  @ApiOperation({
    summary: 'Obtener todos los espacios',
    description:
      'Obtiene una lista de espacios con filtros opcionales y paginación',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de espacios obtenida exitosamente',
  })
  async findAll(@Query() queryDto: QuerySpacesDto) {
    return this.spacesService.findAll(queryDto)
  }

  @Get('my-spaces')
  @ApiOperation({
    summary: 'Obtener mis espacios',
    description: 'Obtiene todos los espacios del usuario autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de espacios del usuario obtenida exitosamente',
  })
  async findMySpaces(
    @CurrentUser() user: JwtPayload,
    @Query() queryDto: QuerySpacesDto,
  ) {
    return this.spacesService.findMySpaces(user.userId, queryDto)
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener un espacio por ID',
    description: 'Obtiene los detalles completos de un espacio específico',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del espacio',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Espacio encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Espacio no encontrado',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.spacesService.findOne(id)
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar un espacio',
    description:
      'Actualiza los datos de un espacio. Solo el propietario puede actualizar su espacio.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del espacio',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Espacio actualizado exitosamente',
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permisos para actualizar este espacio',
  })
  @ApiResponse({
    status: 404,
    description: 'Espacio no encontrado',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
    @Body() updateSpaceDto: UpdateSpaceDto,
  ) {
    // Validar IDs de assets si están presentes en la actualización
    if (updateSpaceDto.logoId) {
      this.spacesService.validateAssetIds([updateSpaceDto.logoId])
    }

    if (updateSpaceDto.photosId && updateSpaceDto.photosId.length > 0) {
      this.spacesService.validateAssetIds(updateSpaceDto.photosId)
    }

    return this.spacesService.update(id, user.userId, updateSpaceDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar un espacio',
    description:
      'Elimina un espacio. Solo el propietario puede eliminar su espacio.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del espacio',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Espacio eliminado exitosamente',
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permisos para eliminar este espacio',
  })
  @ApiResponse({
    status: 404,
    description: 'Espacio no encontrado',
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.spacesService.remove(id, user.userId)
    return { message: 'Espacio eliminado correctamente' }
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Cambiar el estado de un espacio',
    description:
      'Actualiza el estado de un espacio (pending, verified, rejected, etc.). Requiere permisos de administrador.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del espacio',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Estado del espacio actualizado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Espacio no encontrado',
  })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
  ) {
    return this.spacesService.updateStatus(id, status)
  }
}
