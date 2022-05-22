import { ExecutionContext, ValidationPipe } from '@nestjs/common'
import { NestApplication } from '@nestjs/core'
import { Test, TestingModule } from '@nestjs/testing'
import * as cookieParser from 'cookie-parser'
import * as request from 'supertest'
import { AuthModuleMock } from '../../../test/mocks/auth.module.mock'
import { MarketMock, QuikMarketMock } from '../../../test/mocks/market.mock'
import { CategoriesService } from '../../categories/providers/categories.service'
import { JwtAuthGuard } from '../../utils/guards/jwt-auth.guard'
import { MarketsService } from '../providers/markets.service'
import { MarketsController } from './markets.controller'

describe('MarketsController  (e2e)', () => {
  let app: NestApplication
  let controller: MarketsController

  const serviceMock = {
    getAllMarkets: jest.fn(),
    getSingle: jest.fn(),
    createMarket: jest.fn(),
    importMarket: jest.fn(),
  }

  const CategoriesServiceMock = {
    getByMarketId: jest.fn(),
  }

  beforeEach(async () => {
    jest.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthModuleMock],
      controllers: [MarketsController],
      providers: [
        { provide: MarketsService, useValue: serviceMock },
        { provide: CategoriesService, useValue: CategoriesServiceMock },
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
      serviceMock.getSingle.mockResolvedValue(null)

      const res = await request(app.getHttpServer()).get('/markets/someid')
      expect(res.status).toEqual(404)

      expect(serviceMock.getSingle).toHaveBeenCalled()
    })

    it('should return the info for a single market', async () => {
      const market = {
        marketID: 'someId',
        id: 'id',
        categories: [],
      }
      const doc = {
        ...market,
        populate: jest.fn(),
        toJSON: () => market,
      }

      serviceMock.getSingle.mockResolvedValue(doc)
      CategoriesServiceMock.getByMarketId.mockResolvedValue([])

      const res = await request(app.getHttpServer()).get('/markets/someid')
      expect(res.status).toEqual(200)
      expect(res.body).toEqual(market)

      expect(serviceMock.getSingle).toHaveBeenCalledWith('someid')
      expect(doc.populate).not.toHaveBeenCalled()
      expect(CategoriesServiceMock.getByMarketId).not.toHaveBeenCalled()
    })

    it('should return the info with categories and market categories', async () => {
      const market = {
        marketID: 'someId',
        id: 'id',
        categories: [],
      }
      const doc = {
        ...market,
        populate: jest.fn(),
        toJSON: () => market,
      }

      serviceMock.getSingle.mockResolvedValue(doc)
      CategoriesServiceMock.getByMarketId.mockResolvedValue([])

      const res = await request(app.getHttpServer()).get(
        '/markets/someid?expand=categories,marketCategories'
      )
      expect(res.status).toEqual(200)
      expect(res.body).toHaveProperty('marketCategories')

      expect(serviceMock.getSingle).toHaveBeenCalledWith('someid')
      expect(doc.populate).toHaveBeenCalledWith('categories')
      expect(CategoriesServiceMock.getByMarketId).toHaveBeenCalled()
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
