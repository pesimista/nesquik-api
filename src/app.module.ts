import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose'
import { utilities, WinstonModule } from 'nest-winston'
import * as winston from 'winston'
import { AuthModule } from './auth/auth.module'
import { CartsModule } from './carts/carts.module'
import { CategoriesModule } from './categories/categories.module'
import { AppConfigModule } from './config/config.module'
import { AppConfigService } from './config/providers/configuration.service'
import { MarketsModule } from './markets/markets.module'
import { ProductsModule } from './products/products.module'

@Module({
  imports: [
    AppConfigModule,
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          level: 'debug',
          format: winston.format.combine(
            winston.format.timestamp(),
            utilities.format.nestLike()
          ),
        }),
      ],
    }),
    MongooseModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (config: AppConfigService): MongooseModuleOptions => {
        return {
          uri: config.database.uri,
        }
      },
    }),
    MarketsModule,
    ProductsModule,
    ConfigModule,
    CategoriesModule,
    AuthModule,
    CartsModule,
  ],
})
export class AppModule {}
