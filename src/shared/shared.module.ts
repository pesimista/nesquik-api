import { Module } from '@nestjs/common'
import { SharedController } from './controllers/shared.controller'
import { SharedService } from './providers/shared.service'

@Module({
  controllers: [SharedController],
  providers: [SharedService],
})
export class SharedModule {}
