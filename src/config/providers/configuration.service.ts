import { Injectable } from '@nestjs/common'
import { JwtModuleOptions } from '@nestjs/jwt'
import { MongooseModuleOptions } from '@nestjs/mongoose'

@Injectable()
export class AppConfigService {
  get database(): MongooseModuleOptions {
    return {
      uri: process.env.DATABASE_URL,
    }
  }

  get defaultParentCategory(): string {
    return process.env.PARENT_CATEGORY || 'R6JtZlEk1IwViiOvRbKM'
  }

  get jwt(): JwtModuleOptions {
    const minutes = process.env.EXPIRATION_MINUTES || '1'

    return {
      secret: process.env.KEY_SECRET || 'secret',
      signOptions: {
        expiresIn: `${minutes}m`,
      },
    }
  }

  get tokenName(): string {
    return process.env.TOKEN_NAME || 'token'
  }
}
