import { getModelToken } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import {
  Category,
  CategoryDocument,
} from '../../utils/schemas/categories.schema'
import { CategoriesService } from './categories.service'
import { Model } from 'mongoose'
import { Market, MarketDocument } from '../../utils/schemas/market.schema'
import { MarketsService } from '../../markets/providers/markets.service'
import { LoggerMock } from '../../../test/mocks/logger.mock'
import { CategoryMock } from '../../../test/mocks/categories.mock'
import { MarketMock } from '../../../test/mocks/market.mock'
import { PostCategoryDto } from '../dto/postCategory.dto'

type CategoryModel = Model<CategoryDocument>
type MarketModel = Model<MarketDocument>

describe('CategoriesService', () => {
  let service: CategoriesService
  let mockCategoryModel: CategoryModel
  let mockMarketModel: MarketModel

  const ModelMock = {
    ...Model,
    find: jest.fn(),
    create: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: 'winston', useValue: LoggerMock },
        { provide: MarketsService, useValue: mockMarketModel },
        {
          provide: getModelToken(Market.name),
          useValue: ModelMock,
        },
        {
          provide: getModelToken(Category.name),
          useValue: ModelMock,
        },
      ],
    }).compile()

    service = module.get<CategoriesService>(CategoriesService)

    mockCategoryModel = module.get<CategoryModel>(getModelToken(Category.name))
    mockMarketModel = module.get<MarketModel>(getModelToken(Market.name))
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('#getCategories', () => {
    it('should return all the categories', async () => {
      const sortSpy = jest.fn().mockResolvedValue(CategoryMock)
      mockCategoryModel.find = jest.fn().mockReturnValue({ sort: sortSpy })

      const res = await service.getCategories()

      expect(res).toEqual(CategoryMock)
      expect(mockCategoryModel.find).toHaveBeenCalledWith()
      expect(sortSpy).toHaveBeenCalledWith('order')
    })

    it('should return all the categories that match the parent parameter', async () => {
      const sortSpy = jest.fn().mockResolvedValue(CategoryMock)
      mockCategoryModel.find = jest.fn().mockReturnValue({ sort: sortSpy })

      const res = await service.getCategories('someparentId')

      expect(res).toEqual(CategoryMock)
      expect(mockCategoryModel.find).toHaveBeenCalledWith({
        parent: 'someparentId',
      })
      expect(sortSpy).toHaveBeenCalledWith('order')
    })
  })

  describe('#getSingle', () => {
    const id = '625a69f0684f87b3d9b2296c'
    const categoryID = 'ur8nfEuUeBzDr8uvfJcB'

    it('should use findById to return a single category with the given ID', async () => {
      mockCategoryModel.findById = jest.fn().mockReturnValue(CategoryMock[0])
      mockCategoryModel.findOne = jest.fn()

      const res = await service.getSingle(id)

      expect(mockCategoryModel.findById).toHaveBeenCalledWith(id)
      expect(mockCategoryModel.findOne).not.toHaveBeenCalled()
      expect(res.id).toEqual(id)
    })

    it('should use findOne to return a single category', async () => {
      mockCategoryModel.findById = jest.fn()
      mockCategoryModel.findOne = jest.fn().mockReturnValue(CategoryMock[0])

      const res = await service.getSingle(categoryID)

      expect(mockCategoryModel.findOne).toHaveBeenCalledWith({ categoryID })
      expect(mockCategoryModel.findById).not.toHaveBeenCalled()
      expect(res.categoryID).toEqual(categoryID)
    })

    it('return null', async () => {
      mockCategoryModel.findById = jest.fn().mockReturnValue(null)
      mockCategoryModel.findOne = jest.fn().mockReturnValue(null)

      const res = await service.getSingle(id)

      expect(mockCategoryModel.findById).toHaveBeenCalledWith(id)
      expect(mockCategoryModel.findOne).toHaveBeenCalledWith({ categoryID: id })
      expect(res).toBeNull()
    })
  })

  describe('#getByMarketId', () => {
    it('should return all the marketCategories that belong to a market', async () => {
      const sortSpy = jest.fn().mockResolvedValue(CategoryMock)
      mockCategoryModel.find = jest.fn().mockReturnValue({ sort: sortSpy })

      const res = await service.getByMarketId('marketid')

      expect(res.length).toEqual(CategoryMock.length)

      expect(sortSpy).toHaveBeenCalledWith({ order: 'desc' })
      expect(mockCategoryModel.find).toHaveBeenCalledWith({
        market: 'marketid',
      })
    })
  })

  describe('#getCategoriesInMarket', () => {
    it('should return the categories to which the given market belongs to', async () => {
      const doc = {
        MarketMock,
        categories: CategoryMock,
        populate: jest.fn(),
      }

      mockMarketModel.findById = jest.fn().mockResolvedValue(doc)

      const res = await service.getCategoriesInMarket('marketID')

      expect(doc.populate).toHaveBeenCalledWith('categories')
      expect(mockMarketModel.findById).toHaveBeenCalledWith('marketID')

      expect(res).toEqual(CategoryMock)
    })

    it('should return an empty array if the doc is null', async () => {
      mockMarketModel.findById = jest.fn().mockResolvedValue(null)

      const res = await service.getCategoriesInMarket('marketID')

      expect(mockMarketModel.findById).toHaveBeenCalledWith('marketID')

      expect(res).toEqual([])
    })
  })

  describe('#importCategory', () => {
    const dto: PostCategoryDto = { ...CategoryMock[0], marketID: '' }

    it('should update an existing document', async () => {
      const doc = { updateOne: jest.fn() }

      mockCategoryModel.findOne = jest.fn().mockResolvedValue(doc)

      await service.importCategory(dto, null)

      expect(doc.updateOne).toHaveBeenCalled()
      expect(mockCategoryModel.create).not.toHaveBeenCalled()
    })

    it('should create a new document', async () => {
      mockCategoryModel.findOne = jest.fn().mockResolvedValue(null)

      await service.importCategory(dto, null)

      expect(mockCategoryModel.create).toHaveBeenCalled()
    })
  })
})
