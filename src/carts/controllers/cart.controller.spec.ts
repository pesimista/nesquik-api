import { ExecutionContext, ValidationPipe } from '@nestjs/common'
import { NestApplication } from '@nestjs/core'
import { getModelToken } from '@nestjs/mongoose'
import { TestingModule, Test } from '@nestjs/testing'
import * as cookieParser from 'cookie-parser'
import { CategoryMock } from '../../../test/mocks/categories.mock'
import { LoggerMock } from '../../../test/mocks/logger.mock'
import { MarketMock } from '../../../test/mocks/market.mock'
import { ModelMock } from '../../../test/mocks/mongoose.mock'
import { ProductMock } from '../../../test/mocks/product.mock'
import { ProductsService } from '../../products/providers/products.service'
import { JwtAuthGuard } from '../../utils/guards/jwt-auth.guard'
import { Banner } from '../../utils/schemas/banners.schema'
import { Cart, CartOrder } from '../../utils/schemas/carts.schema'
import { Category } from '../../utils/schemas/categories.schema'
import { Market } from '../../utils/schemas/market.schema'
import { Product, ProductOption } from '../../utils/schemas/product.schema'
import { CartService } from '../providers/cart.service'
import { CartController } from './cart.controller'

describe('CartController - Integration', () => {
  let app: NestApplication
  let controller: CartController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [
        CartService,
        ProductsService,
        { provide: 'winston', useValue: LoggerMock },
        {
          provide: getModelToken(Cart.name),
          useValue: ModelMock([]),
        },
        {
          provide: getModelToken(CartOrder.name),
          useValue: jest.fn(),
        },
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

    controller = module.get<CartController>(CartController)

    app = module.createNestApplication()

    app.use(cookieParser())
    app.useGlobalPipes(new ValidationPipe())

    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
