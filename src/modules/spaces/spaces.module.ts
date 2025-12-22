import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SpacesService } from './spaces.service'
import { SpacesController } from './spaces.controller'
import { Space } from './entities/space.entity'
import { AssetsModule } from '../assets/assets.module'
import { NotificationsModule } from '../notifications/notifications.module'
import { User } from '../users/entities/user.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([Space, User]),
    AssetsModule,
    NotificationsModule,
  ],
  controllers: [SpacesController],
  providers: [SpacesService],
  exports: [SpacesService],
})
export class SpacesModule {}
