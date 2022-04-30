import { ExecutionContext, ValidationPipe } from '@nestjs/common'
import { NestApplication } from '@nestjs/core'
import { JwtModule } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'
import * as cookieParser from 'cookie-parser'
import * as request from 'supertest'
import { MarketMock, QuikMarketMock } from '../../../test/mocks/market.mock'
import { UserServiceMock } from '../../../test/mocks/user.service.mock'
import { AuthService } from '../../auth/providers/auth.service'
import { UserService } from '../../auth/providers/user.service'
import { JwtStrategy } from '../../auth/strategies/jwt.strategy'
import { LocalStrategy } from '../../auth/strategies/local.strategy'
import { AppConfigService } from '../../config/providers/configuration.service'
import { JwtAuthGuard } from '../../utils/guards/jwt-auth.guard'
import { MarketsService } from '../providers/markets.service'
import { MarketsController } from './markets.controller'

describe('MarketsController  (e2e)', () => {
  let app: NestApplication
  let controller: MarketsController

  const serviceMock = {
    getAllMarkets: jest.fn(),
    getSingleMarket: jest.fn(),
    createMarket: jest.fn(),
    importMarket: jest.fn(),
  }

  const AppConfigServiceMock = {
    tokenName: 'nesquik',
    jwt: { secret: 'secret' },
  }

  beforeEach(async () => {
    jest.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'secret',
          signOptions: { expiresIn: '1m' },
        }),
      ],
      controllers: [MarketsController],
      providers: [
        { provide: MarketsService, useValue: serviceMock },
        JwtStrategy,
        LocalStrategy,
        AuthService,
        { provide: UserService, useValue: UserServiceMock },
        { provide: AppConfigService, useValue: AppConfigServiceMock },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest()
          req.user = { id: 'userid' }
          return true
        },
      })
      .compile()

    controller = module.get<MarketsController>(MarketsController)

    app = module.createNestApplication()

    app.use(cookieParser())
    app.useGlobalPipes(new ValidationPipe())

    await app.init()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('#Get /markets', () => {
    it('should return a list of markets', async () => {
      serviceMock.getAllMarkets.mockResolvedValue([])

      const res = await request(app.getHttpServer()).get('/markets')
      expect(res.status).toEqual(200)
      expect(res.body).toEqual([])

      expect(serviceMock.getAllMarkets).toHaveBeenCalled()
    })
  })

  describe('#Get /markets/:storeid', () => {
    it('should throw an error if the doc is not registered', async () => {
      serviceMock.getSingleMarket.mockResolvedValue(null)

      const res = await request(app.getHttpServer()).get('/markets/someid')
      expect(res.status).toEqual(404)

      expect(serviceMock.getSingleMarket).toHaveBeenCalled()
    })

    it('should return the info for a single market', async () => {
      const market = {
        marketID: 'someId',
        id: 'id',
      }
      serviceMock.getSingleMarket.mockResolvedValue(market)

      const res = await request(app.getHttpServer()).get('/markets/someid')
      expect(res.status).toEqual(200)
      expect(res.body).toEqual(market)

      expect(serviceMock.getSingleMarket).toHaveBeenCalledWith('someid')
    })
  })

  describe('#Post /markets', () => {
    it('should call the right mehtods', async () => {
      const market = MarketMock

      serviceMock.createMarket.mockResolvedValue(market)
      const res = await request(app.getHttpServer())
        .post('/markets')
        .send(market)

      expect(res.status).toBe(201)
      expect(serviceMock.createMarket).toHaveBeenCalled()
    })
  })

  describe('#Post /markets/import', () => {
    it('should call the right mehtods', async () => {
      const market = QuikMarketMock

      serviceMock.importMarket.mockResolvedValue(market)
      const res = await request(app.getHttpServer()).post('/markets/import')

      expect(res.status).toBe(201)
      expect(serviceMock.importMarket).toHaveBeenCalled()
    })
  })
})
