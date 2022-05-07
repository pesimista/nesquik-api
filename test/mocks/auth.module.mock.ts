import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { AuthService } from '../../src/auth/providers/auth.service'
import { UserService } from '../../src/auth/providers/user.service'
import { JwtStrategy } from '../../src/auth/strategies/jwt.strategy'
import { LocalStrategy } from '../../src/auth/strategies/local.strategy'
import { AppConfigService } from '../../src/config/providers/configuration.service'
import { AppConfigServiceMock } from './config.mocks'
import { UserServiceMock } from './user.service.mock'

@Module({
  imports: [
    JwtModule.register({
      secret: 'secret',
      signOptions: { expiresIn: '1m' },
    }),
  ],
  providers: [
    JwtStrategy,
    LocalStrategy,
    AuthService,
    { provide: UserService, useValue: UserServiceMock },
    { provide: AppConfigService, useValue: AppConfigServiceMock },
  ],
  exports: [
    JwtStrategy,
    LocalStrategy,
    AuthService,
    { provide: UserService, useValue: UserServiceMock },
    { provide: AppConfigService, useValue: AppConfigServiceMock },
  ],
})
export class AuthModuleMock {}
