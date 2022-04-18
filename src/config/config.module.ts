import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppConfigService } from './providers/configuration.service'

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), HttpModule.register({})],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AppConfigModule {}
