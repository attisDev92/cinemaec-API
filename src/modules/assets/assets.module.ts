import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '@nestjs/config'
import { AssetsController } from './assets.controller'
import { AssetsService } from './assets.service'
import { FirebaseService } from './services/firebase.service'
import { Asset } from './entities/asset.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Asset]), ConfigModule],
  controllers: [AssetsController],
  providers: [AssetsService, FirebaseService],
  exports: [AssetsService, FirebaseService],
})
export class AssetsModule {}
