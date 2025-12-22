import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  ParseIntPipe,
  Patch,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger'
import { NotificationsService } from './notifications.service'
import { CreateNotificationDto } from './dto/create-notification.dto'
import { Notification } from './entities/notification.entity'
import { JwtAuthGuard } from '../users/guards/jwt-auth.guard'

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * Crear una nueva notificación (solo para admins)
   */
  @Post()
  @ApiOperation({
    summary: 'Crear una nueva notificación',
    description: 'Permite crear una notificación para un usuario específico',
  })
  @ApiResponse({
    status: 201,
    description: 'Notificación creada exitosamente',
    type: Notification,
  })
  async create(
    @Body() createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    return this.notificationsService.create(createNotificationDto)
  }

  /**
   * Obtener todas las notificaciones del usuario autenticado
   */
  @Get()
  @ApiOperation({
    summary: 'Obtener mis notificaciones',
    description: 'Obtiene todas las notificaciones del usuario autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de notificaciones',
    type: [Notification],
  })
  async findMyNotifications(@Request() req: any): Promise<Notification[]> {
    const userId = req.user.sub
    return this.notificationsService.findAllByUser(userId)
  }

  /**
   * Obtener notificaciones no leídas del usuario autenticado
   */
  @Get('unread')
  @ApiOperation({
    summary: 'Obtener notificaciones no leídas',
    description: 'Obtiene las notificaciones no leídas del usuario autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de notificaciones no leídas',
    type: [Notification],
  })
  async findUnread(@Request() req: any): Promise<Notification[]> {
    const userId = req.user.sub
    return this.notificationsService.findUnreadByUser(userId)
  }

  /**
   * Contar notificaciones no leídas
   */
  @Get('unread/count')
  @ApiOperation({
    summary: 'Contar notificaciones no leídas',
    description: 'Obtiene el número de notificaciones no leídas',
  })
  @ApiResponse({
    status: 200,
    description: 'Número de notificaciones no leídas',
  })
  async countUnread(@Request() req: any): Promise<{ count: number }> {
    const userId = req.user.sub
    const count = await this.notificationsService.countUnreadByUser(userId)
    return { count }
  }

  /**
   * Marcar una notificación como leída
   */
  @Patch(':id/read')
  @ApiOperation({
    summary: 'Marcar notificación como leída',
    description: 'Marca una notificación específica como leída',
  })
  @ApiResponse({
    status: 200,
    description: 'Notificación marcada como leída',
    type: Notification,
  })
  @ApiResponse({
    status: 404,
    description: 'Notificación no encontrada',
  })
  async markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ): Promise<Notification> {
    const userId = req.user.sub
    return this.notificationsService.markAsRead(id, userId)
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  @Patch('read-all')
  @ApiOperation({
    summary: 'Marcar todas como leídas',
    description: 'Marca todas las notificaciones del usuario como leídas',
  })
  @ApiResponse({
    status: 200,
    description: 'Notificaciones marcadas como leídas',
  })
  async markAllAsRead(@Request() req: any): Promise<{ affected: number }> {
    const userId = req.user.sub
    return this.notificationsService.markAllAsRead(userId)
  }

  /**
   * Eliminar una notificación
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar una notificación',
    description: 'Elimina una notificación específica',
  })
  @ApiResponse({
    status: 200,
    description: 'Notificación eliminada',
  })
  @ApiResponse({
    status: 404,
    description: 'Notificación no encontrada',
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ): Promise<void> {
    const userId = req.user.sub
    return this.notificationsService.remove(id, userId)
  }

  /**
   * Eliminar todas las notificaciones del usuario
   */
  @Delete()
  @ApiOperation({
    summary: 'Eliminar todas mis notificaciones',
    description: 'Elimina todas las notificaciones del usuario autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Notificaciones eliminadas',
  })
  async removeAll(@Request() req: any): Promise<{ affected: number }> {
    const userId = req.user.sub
    return this.notificationsService.removeAllByUser(userId)
  }
}
