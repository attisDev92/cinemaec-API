import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Notification } from './entities/notification.entity'
import { CreateNotificationDto } from './dto/create-notification.dto'

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) {}

  /**
   * Crear una nueva notificación
   */
  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    const notification = this.notificationsRepository.create(
      createNotificationDto,
    )
    return await this.notificationsRepository.save(notification)
  }

  /**
   * Obtener todas las notificaciones de un usuario
   */
  async findAllByUser(userId: number): Promise<Notification[]> {
    return await this.notificationsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    })
  }

  /**
   * Obtener notificaciones no leídas de un usuario
   */
  async findUnreadByUser(userId: number): Promise<Notification[]> {
    return await this.notificationsRepository.find({
      where: { userId, isRead: false },
      order: { createdAt: 'DESC' },
    })
  }

  /**
   * Contar notificaciones no leídas de un usuario
   */
  async countUnreadByUser(userId: number): Promise<number> {
    return await this.notificationsRepository.count({
      where: { userId, isRead: false },
    })
  }

  /**
   * Obtener una notificación por ID
   */
  async findOne(id: number): Promise<Notification> {
    const notification = await this.notificationsRepository.findOne({
      where: { id },
    })

    if (!notification) {
      throw new NotFoundException(`Notificación con ID ${id} no encontrada`)
    }

    return notification
  }

  /**
   * Marcar una notificación como leída
   */
  async markAsRead(id: number, userId: number): Promise<Notification> {
    const notification = await this.findOne(id)

    // Verificar que la notificación pertenece al usuario
    if (notification.userId !== userId) {
      throw new NotFoundException(`Notificación con ID ${id} no encontrada`)
    }

    notification.isRead = true
    return await this.notificationsRepository.save(notification)
  }

  /**
   * Marcar todas las notificaciones de un usuario como leídas
   */
  async markAllAsRead(userId: number): Promise<{ affected: number }> {
    const result = await this.notificationsRepository.update(
      { userId, isRead: false },
      { isRead: true },
    )

    return { affected: result.affected || 0 }
  }

  /**
   * Eliminar una notificación
   */
  async remove(id: number, userId: number): Promise<void> {
    const notification = await this.findOne(id)

    // Verificar que la notificación pertenece al usuario
    if (notification.userId !== userId) {
      throw new NotFoundException(`Notificación con ID ${id} no encontrada`)
    }

    await this.notificationsRepository.remove(notification)
  }

  /**
   * Eliminar todas las notificaciones de un usuario
   */
  async removeAllByUser(userId: number): Promise<{ affected: number }> {
    const result = await this.notificationsRepository.delete({ userId })
    return { affected: result.affected || 0 }
  }
}
