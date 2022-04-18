import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose'
import { CategoriesModule } from './categories/categories.module'
import { AppConfigModule } from './config/config.module'
import { AppConfigService } from './config/providers/configuration.service'
import { MarketsModule } from './markets/markets.module'
import { ProductsModule } from './products/products.module'
import { SharedModule } from './shared/shared.module'

@Module({
  imports: [
    AppConfigModule,
    MongooseModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (config: AppConfigService): MongooseModuleOptions => {
        console.log(config.database.uri)
        return {
          uri: config.database.uri,
        }
      },
    }),
    MarketsModule,
    ProductsModule,
    ConfigModule,
    CategoriesModule,
    SharedModule,
  ],
  controllers: [],
})
export class AppModule {}
