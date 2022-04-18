import { Injectable } from '@nestjs/common'
import { MongooseModuleOptions } from '@nestjs/mongoose'

@Injectable()
export class AppConfigService {
  get database(): MongooseModuleOptions {
    return {
      uri: process.env.DATABASE_URL,
    }
  }
}
