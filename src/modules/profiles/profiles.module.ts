import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ProfilesService } from './profiles.service'
import { ProfilesController } from './profiles.controller'
import { Profile } from './entities/profile.entity'
import { User } from '../users/entities/user.entity'
import { UsersModule } from '../users/users.module'
import { AssetsModule } from '../assets/assets.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Profile, User]),
    UsersModule,
    AssetsModule,
  ],
  controllers: [ProfilesController],
  providers: [ProfilesService],
  exports: [ProfilesService],
})
export class ProfilesModule {}
