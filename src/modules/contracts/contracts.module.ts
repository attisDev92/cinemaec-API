import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ContractsService } from './contracts.service'
import { ContractsController } from './contracts.controller'
import { Contract } from './entities/contract.entity'
import { SpacesModule } from '../spaces/spaces.module'

@Module({
  imports: [TypeOrmModule.forFeature([Contract]), SpacesModule],
  controllers: [ContractsController],
  providers: [ContractsService],
  exports: [ContractsService],
})
export class ContractsModule {}
