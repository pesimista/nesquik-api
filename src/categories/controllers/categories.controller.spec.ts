import {
  ExecutionContext,
  HttpException,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common'
import { NestApplication } from '@nestjs/core'
import { Test, TestingModule } from '@nestjs/testing'
import * as cookieParser from 'cookie-parser'
import * as request from 'supertest'
import { AuthModuleMock } from '../../../test/mocks/auth.module.mock'
import { CategoryMock } from '../../../test/mocks/categories.mock'
import { AppConfigServiceMock } from '../../../test/mocks/config.mocks'
import { MarketMock } from '../../../test/mocks/market.mock'
import { AppConfigService } from '../../config/providers/configuration.service'
import { MarketsService } from '../../markets/providers/markets.service'
import { JwtAuthGuard } from '../../utils/guards/jwt-auth.guard'
import { CategoriesService } from '../providers/categories.service'
import { CategoriesController } from './categories.controller'

describe('CategoriesController', () => {
  let controller: CategoriesController
  let app: NestApplication

  const mockCategoryService = {
    getCategories: jest.fn(),
    getCategoriesInMarket: jest.fn(),
    getSingle: jest.fn(),
    importCategory: jest.fn(),
    getByMarketId: jest.fn(),
  }

  const MarketsServiceMock = {
    getSingle: jest.fn(),
  }

  beforeEach(async () => {
    jest.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthModuleMock],
      controllers: [CategoriesController],
      providers: [
        { provide: MarketsService, useValue: MarketsServiceMock },
        { provide: CategoriesService, useValue: mockCategoryService },
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

    controller = module.get<CategoriesController>(CategoriesController)

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

  describe('#Get /categories', () => {
    it('should return all the values with the default parent name', async () => {
      mockCategoryService.getCategories.mockResolvedValue(CategoryMock)

      const response = await request(app.getHttpServer()).get('/categories')

      expect(response.body.length).toEqual(CategoryMock.length)
      expect(mockCategoryService.getCategories).toHaveBeenCalledWith(
        AppConfigServiceMock.defaultParentCategory
      )
    })

    it('should return all the values with the given parent name', async () => {
      mockCategoryService.getCategories.mockResolvedValue(CategoryMock)

      const response = await request(app.getHttpServer()).get(
        '/categories?parent=somethinggreater'
      )

      expect(response.body.length).toEqual(CategoryMock.length)
      expect(mockCategoryService.getCategories).toHaveBeenCalledWith(
        'somethinggreater'
      )
    })
  })

  describe('#Get /categories/market/:marketid', () => {
    it('should return both the categories and the marketCategories', async () => {
      const cat = [CategoryMock[0]]
      const marketCat = [CategoryMock[1]]

      mockCategoryService.getByMarketId.mockResolvedValue(cat)
      mockCategoryService.getCategoriesInMarket.mockResolvedValue(marketCat)

      const response = await request(app.getHttpServer()).get(
        '/categories/market/marketid'
      )

      expect(response.body).toHaveProperty('categories')
      expect(response.body).toHaveProperty('marketCategories')

      expect(mockCategoryService.getByMarketId).toHaveBeenCalledWith('marketid')
      expect(mockCategoryService.getCategoriesInMarket).toHaveBeenCalledWith(
        'marketid'
      )
    })

    it('should throw an error', async () => {
      mockCategoryService.getByMarketId.mockResolvedValue(CategoryMock)
      mockCategoryService.getCategoriesInMarket.mockRejectedValue(
        new HttpException('internal error', HttpStatus.UNPROCESSABLE_ENTITY)
      )

      const response = await request(app.getHttpServer()).get(
        '/categories/market/marketid'
      )

      expect(response.status).toEqual(HttpStatus.UNPROCESSABLE_ENTITY)

      expect(mockCategoryService.getByMarketId).toHaveBeenCalledWith('marketid')
      expect(mockCategoryService.getCategoriesInMarket).toHaveBeenCalledWith(
        'marketid'
      )
    })
  })

  describe('#Get /categories/:id', () => {
    it('should return a single category', async () => {
      const id = CategoryMock[0].id
      mockCategoryService.getSingle.mockResolvedValue(CategoryMock[0])

      const response = await request(app.getHttpServer()).get(
        `/categories/${id}`
      )

      expect(response.body).toEqual(CategoryMock[0])
      expect(mockCategoryService.getSingle).toHaveBeenCalledWith(id)
    })

    it('should throw an error if there is not a match for the category', async () => {
      const id = CategoryMock[0].id
      mockCategoryService.getSingle.mockResolvedValue(null)

      const response = await request(app.getHttpServer()).get(
        `/categories/${id}`
      )

      expect(response.status).toEqual(HttpStatus.NOT_FOUND)
      expect(mockCategoryService.getSingle).toHaveBeenCalledWith(id)
    })
  })

  describe('#Post /categories', () => {
    it('should update an existing category', async () => {
      mockCategoryService.importCategory.mockImplementation((item) => item)

      const category = CategoryMock[0]

      const response = await request(app.getHttpServer())
        .post(`/categories`)
        .send(category)

      expect(response.status).toEqual(HttpStatus.CREATED)

      expect(MarketsServiceMock.getSingle).not.toHaveBeenCalled()
      expect(mockCategoryService.importCategory).toHaveBeenCalledWith(
        category,
        undefined
      )
    })

    it('should create an existing category', async () => {
      MarketsServiceMock.getSingle.mockResolvedValue(MarketMock)
      mockCategoryService.importCategory.mockImplementation((item) => item)

      const category = CategoryMock[1]
      category.marketID = 'somethingsomethign'

      const response = await request(app.getHttpServer())
        .post(`/categories`)
        .send(category)

      expect(response.status).toEqual(HttpStatus.CREATED)
      expect(MarketsServiceMock.getSingle).toHaveBeenCalled()
      expect(mockCategoryService.importCategory).toHaveBeenCalledWith(
        category,
        MarketMock
      )
    })
  })
})
