import { getModelToken } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import { Category } from '../../utils/schemas/categories.schema'
import { CategoriesService } from './categories.service'
import { Model } from 'mongoose'
import { MarketDocument } from '../../utils/schemas/market.schema'

type CategoryModel = Model<MarketDocument>

describe('CategoriesService', () => {
  let service: CategoriesService
  let mockCategoryModel: CategoryModel

  const ModelMock = {
    ...Model,
    find: jest.fn(),
    create: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getModelToken(Category.name),
          useValue: ModelMock,
        },
      ],
    }).compile()

    service = module.get<CategoriesService>(CategoriesService)

    mockCategoryModel = module.get<CategoryModel>(getModelToken(Category.name))
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
