import { ExecutionContext, ValidationPipe } from '@nestjs/common'
import { NestApplication } from '@nestjs/core'
import { getModelToken } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import * as cookieParser from 'cookie-parser'
import * as request from 'supertest'
import { AuthModuleMock } from '../../../test/mocks/auth.module.mock'
import { CategoryMock } from '../../../test/mocks/categories.mock'
import { LoggerMock } from '../../../test/mocks/logger.mock'
import { MarketMock } from '../../../test/mocks/market.mock'
import { ModelMockType, ModelMock } from '../../../test/mocks/mongoose.mock'
import { ProductMock, QuikProducMock } from '../../../test/mocks/product.mock'
import { CategoriesService } from '../../categories/providers/categories.service'
import { MarketsService } from '../../markets/providers/markets.service'
import { JwtAuthGuard } from '../../utils/guards/jwt-auth.guard'
import { Banner } from '../../utils/schemas/banners.schema'
import { Category } from '../../utils/schemas/categories.schema'
import { Market } from '../../utils/schemas/market.schema'
import { Product, ProductOption } from '../../utils/schemas/product.schema'
import { ProductsService } from '../providers/products.service'
import { ProductsController } from './products.controller'

describe('ProductsController - Integration', () => {
  let app: NestApplication
  let controller: ProductsController
  let productModelMock: ModelMockType
  let marketModelMock: ModelMockType

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthModuleMock],
      controllers: [ProductsController],
      providers: [
        ProductsService,
        MarketsService,
        CategoriesService,
        { provide: 'winston', useValue: LoggerMock },
        {
          provide: getModelToken(Product.name),
          useValue: ModelMock([ProductMock]),
        },
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
        {
          provide: getModelToken(ProductOption.name),
          useValue: jest.fn().mockImplementation((item) => item),
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

    controller = module.get<ProductsController>(ProductsController)
    productModelMock = module.get<ModelMockType>(getModelToken(Product.name))
    marketModelMock = module.get<ModelMockType>(getModelToken(Market.name))

    app = module.createNestApplication()

    app.use(cookieParser())
    app.useGlobalPipes(new ValidationPipe())

    await app.init()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('#Get /products', () => {
    it('should return all the products', async () => {
      const res = await request(app.getHttpServer()).get('/products')

      expect(res.status).toEqual(200)
      expect(res.body).toHaveProperty('count', 1)
      expect(res.body).toHaveProperty('items')
    })
  })

  describe('#Get /products/:id', () => {
    it('should return a single item', async () => {
      const res = await request(app.getHttpServer()).get(
        `/products/${ProductMock.id}`
      )

      expect(res.status).toEqual(200)
      expect(res.body).toEqual(ProductMock)
    })

    it('should throw an error if the id doesnt match any id', async () => {
      const doc = {
        populate: function (key) {
          if (key !== 'market') {
            return this
          }
          return null
        },
      }

      productModelMock.findOne = jest.fn().mockReturnValue(doc)

      const res = await request(app.getHttpServer()).get(
        `/products/somerandomid`
      )

      expect(res.status).toEqual(404)
      expect(res.body).toHaveProperty('statusCode', 404)
      expect(res.body).toHaveProperty('message', 'Product not found')
      expect(res.body).toHaveProperty('error', 'Not Found')
    })
  })

  describe('#Post /products/import', () => {
    it('should add the product to the database as well as the subproducts', async () => {
      productModelMock.findOne = jest.fn().mockReturnValue(null)

      const res = await request(app.getHttpServer())
        .post('/products/import')
        .send(QuikProducMock)

      expect(res.status).toEqual(201)
      expect(res.body).toHaveProperty('name', 'Burger suprema de carne')
      expect(res.body).toHaveProperty('productID', 'uZyqOprEHbyP6YDJzj04')
      expect(res.body.options.length).toEqual(1)

      expect(productModelMock.create).toHaveBeenCalled()
      expect(productModelMock.findOne).toHaveBeenCalledTimes(5)
    })

    it('should update the product to the database', async () => {
      const document = {
        ...ProductMock,
        productID: ProductMock.id,
        options: [],
        updateOne: jest.fn(),
      }

      productModelMock.findOne = jest.fn().mockReturnValue(document)
      const prod = { ...QuikProducMock }
      delete prod.options

      const res = await request(app.getHttpServer())
        .post('/products/import')
        .send(prod)

      expect(res.status).toEqual(201)
      expect(res.body).toHaveProperty('name', 'Burger suprema de carne')
      expect(res.body.options.length).toEqual(0)

      expect(document.updateOne).toHaveBeenCalled()
      expect(productModelMock.findOne).toHaveBeenCalledTimes(1)
    })

    it('should return an error if the market associated doesnt exist', async () => {
      const doc = { populate: () => null }

      marketModelMock.findOne = jest.fn().mockReturnValue(doc)

      const res = await request(app.getHttpServer())
        .post('/products/import')
        .send(QuikProducMock)

      expect(res.status).toEqual(400)
      expect(res.body).toHaveProperty('statusCode', 400)
      expect(res.body).toHaveProperty(
        'message',
        'Market not found for this product'
      )
      expect(res.body).toHaveProperty('error', 'Bad Request')
    })
  })
})
