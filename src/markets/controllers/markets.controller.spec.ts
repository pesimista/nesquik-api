import { ExecutionContext, ValidationPipe } from '@nestjs/common'
import { NestApplication } from '@nestjs/core'
import { getModelToken } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import * as cookieParser from 'cookie-parser'
import * as request from 'supertest'
import { AuthModuleMock } from '../../../test/mocks/auth.module.mock'
import { CategoryMock } from '../../../test/mocks/categories.mock'
import { LoggerMock } from '../../../test/mocks/logger.mock'
import { MarketMock, QuikMarketMock } from '../../../test/mocks/market.mock'
import { ModelMock, ModelMockType } from '../../../test/mocks/mongoose.mock'
import { CategoriesService } from '../../categories/providers/categories.service'
import { JwtAuthGuard } from '../../utils/guards/jwt-auth.guard'
import { Banner } from '../../utils/schemas/banners.schema'
import { Category } from '../../utils/schemas/categories.schema'
import { Market } from '../../utils/schemas/market.schema'
import { MarketsService } from '../providers/markets.service'
import { MarketsController } from './markets.controller'

describe('MarketsController - Integration', () => {
  let app: NestApplication
  let controller: MarketsController
  let categoryModelMock: ModelMockType
  let marketModelMock: ModelMockType

  beforeEach(async () => {
    jest.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthModuleMock],
      controllers: [MarketsController],
      providers: [
        MarketsService,
        CategoriesService,
        { provide: 'winston', useValue: LoggerMock },
        {
          provide: getModelToken(Market.name),
          useValue: ModelMock([MarketMock]),
        },
        {
          provide: getModelToken(Category.name),
          useValue: ModelMock([CategoryMock]),
        },
        {
          provide: getModelToken(Banner.name),
          useValue: jest.fn(),
        },
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
    marketModelMock = module.get<ModelMockType>(getModelToken(Market.name))
    categoryModelMock = module.get<ModelMockType>(getModelToken(Category.name))

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
      marketModelMock.find = jest.fn().mockReturnValue({
        populate: () => ({
          sort: () => marketModelMock.collection,
        }),
      })

      const res = await request(app.getHttpServer()).get('/markets')

      expect(res.status).toEqual(200)
      expect(res.body).toHaveProperty('count', 1)
      expect(res.body).toHaveProperty('items')
    })
  })

  describe('#Get /markets/:storeid', () => {
    it('should throw an error if the doc is not registered', async () => {
      marketModelMock.findOne = jest.fn().mockReturnValue({
        populate: () => null,
      })

      const res = await request(app.getHttpServer()).get('/markets/someid')

      expect(res.status).toEqual(404)
      expect(res.body).toHaveProperty('statusCode', 404)
      expect(res.body).toHaveProperty(
        'message',
        'Market with the given id not found'
      )
    })

    it('should return the info for a single market', async () => {
      categoryModelMock.find = jest
        .fn()
        .mockReturnValue({ sort: () => categoryModelMock.collection })

      const res = await request(app.getHttpServer()).get(
        `/markets/${MarketMock.marketID}`
      )
      expect(res.status).toEqual(200)
      expect(res.body).toHaveProperty('marketID', MarketMock.marketID)
      expect(res.body).toHaveProperty('id', MarketMock.id)
      expect(res.body).toHaveProperty('marketCategories')
    })
  })

  describe('#Post /markets', () => {
    it('should call the right mehtods', async () => {
      marketModelMock.findOne = jest.fn().mockReturnValue({
        populate: () => null,
      })

      const res = await request(app.getHttpServer())
        .post('/markets')
        .send(MarketMock)

      expect(res.status).toBe(201)
      expect(res.body).toHaveProperty('id', MarketMock.id)
      expect(res.body).toHaveProperty('marketID', MarketMock.marketID)
    })

    it('should throw a CONFLICT error', async () => {
      const res = await request(app.getHttpServer())
        .post('/markets')
        .send(MarketMock)

      expect(res.status).toEqual(409)
      expect(res.body).toHaveProperty('statusCode', 409)
      expect(res.body).toHaveProperty(
        'message',
        'Market with given marketID already exists'
      )
    })
  })

  describe('#Post /markets/import', () => {
    it('should call the right methods and create a new market', async () => {
      marketModelMock.findOne = jest.fn().mockReturnValue({
        populate: () => null,
      })

      const market = { ...QuikMarketMock }
      delete market.marketing

      const res = await request(app.getHttpServer())
        .post('/markets/import')
        .send(market)

      expect(res.status).toBe(201)
      expect(res.body).toHaveProperty('marketID', market.marketID)
      expect(res.body).toHaveProperty('categories')

      expect(marketModelMock.create).toHaveBeenCalled()
      expect(marketModelMock.doc.updateOne).not.toHaveBeenCalled()
    })

    it('should call the right methods and update an existing market', async () => {
      marketModelMock.doc.updateOne.mockImplementation((item) => item)

      const res = await request(app.getHttpServer())
        .post('/markets/import')
        .send(QuikMarketMock)

      expect(res.status).toBe(201)
      expect(res.body).toHaveProperty('marketID', QuikMarketMock.marketID)
      expect(res.body).toHaveProperty('categories')

      expect(marketModelMock.create).not.toHaveBeenCalled()
      expect(marketModelMock.doc.updateOne).toHaveBeenCalled()
    })
  })
})
