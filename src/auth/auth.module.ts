/* eslint-disable @typescript-eslint/no-this-alias */
import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { MongooseModule } from '@nestjs/mongoose'
import { PassportModule } from '@nestjs/passport'
import { AppConfigModule } from '../config/config.module'
import { AppConfigService } from '../config/providers/configuration.service'
import { AuthController } from './contollers/auth.controller'
import { AuthService } from './providers/auth.service'
import { LocalStrategy } from './strategies/local.strategy'
import { UserService } from './providers/user.service'
import { User, UserSchema } from './schemas/users.schema'
import { JwtStrategy } from './strategies/jwt.strategy'

@Module({
  imports: [
    AppConfigModule,
    PassportModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.registerAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => {
        return {
          secret: config.jwt.secret,
          signOptions: { expiresIn: config.jwt.signOptions.expiresIn },
        }
      },
    }),
  ],
  providers: [AuthService, UserService, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
