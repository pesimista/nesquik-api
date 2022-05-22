import { Test, TestingModule } from '@nestjs/testing'
import {
  ProductModel,
  OptionModel,
  Product,
  ProductOption,
} from '../../utils/schemas/product.schema'
import { ProductsService } from './products.service'
import { Model } from 'mongoose'
import { LoggerMock } from '../../../test/mocks/logger.mock'
import { getModelToken } from '@nestjs/mongoose'
import { fail } from 'assert'
import { ProductMock, QuikProducMock } from '../../../test/mocks/product.mock'

describe('ProductsService', () => {
  let service: ProductsService
  let mockProductModel: ProductModel
  let mockOptionModel: jest.Mock

  const ModelMock = {
    ...Model,
    find: jest.fn(),
    create: jest.fn(),
  }

  beforeEach(async () => {
    jest.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: 'winston', useValue: LoggerMock },
        {
          provide: getModelToken(Product.name),
          useValue: ModelMock,
        },
        {
          provide: getModelToken(ProductOption.name),
          useValue: jest.fn(),
        },
      ],
    }).compile()

    service = module.get<ProductsService>(ProductsService)
    mockProductModel = module.get<ProductModel>(getModelToken(Product.name))
    mockOptionModel = module.get<jest.Mock>(getModelToken(ProductOption.name))
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('#getAllProducts', () => {
    it('should return a query using market and main products', async () => {
      await service.getAllProducts({
        market: 'somemarket',
      })

      expect(mockProductModel.find).toHaveBeenCalledWith({
        market: 'somemarket',
        isSubproduct: false,
      })
    })

    it('should return a query with all subproducts', async () => {
      await service.getAllProducts({
        subproducts: true,
        market: null,
      })

      expect(mockProductModel.find).toHaveBeenCalledWith({
        isSubproduct: true,
      })
    })
  })

  describe('#getSingle', () => {
    it('should find the doc by id', async () => {
      const product = {
        ...ProductMock,
        populate: jest.fn().mockReturnThis(),
      }

      mockProductModel.findById = jest.fn().mockReturnValue(product)
      const findOneSpy = jest.spyOn(mockProductModel, 'findOne')

      try {
        const res = await service.getSingle(product.id)
        expect(mockProductModel.findById).toHaveBeenCalledWith(product.id)
        expect(product.populate).toHaveBeenCalledTimes(3)

        expect(findOneSpy).not.toHaveBeenCalled()
        expect(res).toEqual(product)
      } catch (error) {
        fail(`unexpected code path: ${error.message}`)
      }
    })

    it('should find the doc by productID', async () => {
      const product = {
        ...ProductMock,
        populate: jest.fn().mockReturnThis(),
      }

      mockProductModel.findOne = jest.fn().mockReturnValue(product)
      const findByIdSpy = jest.spyOn(mockProductModel, 'findById')

      try {
        const res = await service.getSingle(product.productID)
        expect(findByIdSpy).not.toHaveBeenCalled()
        expect(mockProductModel.findOne).toHaveBeenCalledWith({
          productID: product.productID,
        })
        expect(product.populate).toHaveBeenCalledTimes(3)
        expect(res).toEqual(product)
      } catch (error) {
        fail(`unexpected code path: ${error.message}`)
      }
    })
  })

  describe('#formatProduct', () => {
    it('should return the quik product formated', async () => {
      const res = service.formatProduct(QuikProducMock)

      expect(res).toHaveProperty('isSubproduct', false)
      expect(res).toHaveProperty('name', 'Burger suprema de carne')
      expect(res).toHaveProperty('productID', 'uZyqOprEHbyP6YDJzj04')
      expect(res).toHaveProperty('stock', 100)
      expect(res).toHaveProperty('rating', 5)
      expect(res).toHaveProperty('isExclusive', true)
      expect(res).toHaveProperty('tags')
      expect(res).toHaveProperty('description')
      expect(res).toHaveProperty('shortDescription')
      expect(res).toHaveProperty('pictures')
      expect(res).toHaveProperty('isAvailable', true)
      expect(res).toHaveProperty('priority', 990)
      expect(res).toHaveProperty('magnitude', 1)
      expect(res).toHaveProperty('measure', 'U')
      expect(res).toHaveProperty('price', 4.99)
      expect(res).toHaveProperty('promoValue', 0)
      expect(res).toHaveProperty('isPromo', false)
    })

    it('should return the quik product formated using defaults', async () => {
      const mock = { ...QuikProducMock }
      mock.rating = null
      mock.shortDescription = null
      mock.magnitude = null
      mock.measure = null
      mock.productID = null

      const res = service.formatProduct(mock)

      expect(res.rating).toEqual(0)
      expect(res.shortDescription).toEqual(mock.description)
      expect(res.magnitude).toEqual(1)
      expect(res.measure).toEqual('U')
    })
  })

  describe('#importProduct', () => {
    it('should create a new product', async () => {
      mockProductModel.findOne = jest.fn().mockResolvedValue(null)
      mockProductModel.create = jest.fn()

      await service.importProduct(QuikProducMock)

      expect(mockProductModel.create).toHaveBeenCalled()
      expect(mockProductModel.findOne).toHaveBeenCalled()
    })

    it('should update an already created product', async () => {
      const doc = {
        ...ProductMock,
        updateOne: jest.fn(),
      }

      mockProductModel.findOne = jest.fn().mockResolvedValue(doc)
      mockProductModel.create = jest.fn()

      await service.importProduct(QuikProducMock)

      expect(mockProductModel.create).not.toHaveBeenCalled()
      expect(mockProductModel.findOne).toHaveBeenCalled()
      expect(doc.updateOne).toHaveBeenCalled()
    })

    it('should update an already created product and update the productID', async () => {
      let prodID = ''
      const doc = {
        ...ProductMock,
        productID: 'someshort',
        updateOne: jest
          .fn()
          .mockImplementation((item) => (prodID = item.productID)),
      }

      mockProductModel.findOne = jest.fn().mockResolvedValue(doc)
      mockProductModel.create = jest.fn()

      await service.importProduct(QuikProducMock)

      expect(mockProductModel.create).not.toHaveBeenCalled()
      expect(mockProductModel.findOne).toHaveBeenCalled()
      expect(doc.updateOne).toHaveBeenCalled()
      expect(prodID).toEqual(QuikProducMock.productID)
    })

    it('should not update a main product if the infoming is a subproduct', async () => {
      const doc = {
        ...ProductMock,
        updateOne: jest.fn(),
      }

      const dto = { ...QuikProducMock, isSubproduct: true }

      mockProductModel.findOne = jest.fn().mockResolvedValue(doc)
      mockProductModel.create = jest.fn()

      await service.importProduct(dto)

      expect(mockProductModel.create).not.toHaveBeenCalled()
      expect(mockProductModel.findOne).toHaveBeenCalled()
      expect(doc.updateOne).not.toHaveBeenCalled()
    })
  })

  describe('#importSubproducts', () => {
    it('should add all options as products', async () => {
      mockProductModel.findOne = jest.fn().mockResolvedValue(null)
      mockProductModel.create = jest.fn().mockImplementation((item) => item)
      mockOptionModel.mockImplementation((item) => ({
        type: item.type,
        label: item.label,
        iterable: item.iterable,
        usesPrice: Boolean(item.usesPrice),
        required: item.required,
        elements: item.elements,
      }))

      const res = await service.importSubproducts(QuikProducMock.options[0])

      expect(res).toHaveProperty('type', 'checkbox')
      expect(res).toHaveProperty('label', 'Extras de la Burger')
      expect(res).toHaveProperty('iterable', true)
      expect(res).toHaveProperty('usesPrice', false)
      expect(res).toHaveProperty('required', false)
      expect(res).toHaveProperty('elements')
    })
  })

  describe('#clear', () => {
    it('should run', async () => {
      mockProductModel.deleteMany = jest.fn()

      await service.clear()
    })
  })
})
