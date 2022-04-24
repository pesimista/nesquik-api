import { Test, TestingModule } from '@nestjs/testing'
import { AppConfigService } from './configuration.service'

describe('AppConfigService', () => {
  let service: AppConfigService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppConfigService],
    }).compile()

    service = module.get<AppConfigService>(AppConfigService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('#database', () => {
    it('should return the data for database', () => {
      process.env.DATABASE_URL = 'value'

      const database = service.database

      expect(database).toEqual({
        uri: 'value',
      })
    })
  })

  describe('#jwt', () => {
    it('should return the default data for jwt', () => {
      const jwt = service.jwt

      expect(jwt).toEqual({
        secret: 'secret',
        signOptions: {
          expiresIn: `1m`,
        },
      })
    })

    it('should return the data for jwt', () => {
      process.env.EXPIRATION_MINUTES = '10'
      process.env.KEY_SECRET = 'value'

      const jwt = service.jwt

      expect(jwt).toEqual({
        secret: 'value',
        signOptions: {
          expiresIn: `10m`,
        },
      })
    })
  })
  describe('#tokenName', () => {
    it('should return the data for tokenName', () => {
      const tokenName = service.tokenName

      expect(tokenName).toEqual('token')
    })
  })
})
