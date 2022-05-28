import { getModelToken } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import { fail } from 'assert'
import { LoggerMock } from '../../../test/mocks/logger.mock'
import { ModelMockType, ModelMock } from '../../../test/mocks/mongoose.mock'
import { ProductMock, QuikProducMock } from '../../../test/mocks/product.mock'
import { Product, ProductOption } from '../../utils/schemas/product.schema'
import { ProductsService } from './products.service'

describe('ProductsService', () => {
  let service: ProductsService
  let productModelMock: ModelMockType
  let mockOptionModel: jest.Mock

  beforeEach(async () => {
    jest.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: 'winston', useValue: LoggerMock },
        {
          provide: getModelToken(Product.name),
          useValue: ModelMock([ProductMock]),
        },
        {
          provide: getModelToken(ProductOption.name),
          useValue: jest.fn(),
        },
      ],
    }).compile()

    service = module.get<ProductsService>(ProductsService)
    productModelMock = module.get<ModelMockType>(getModelToken(Product.name))
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

      expect(productModelMock.find).toHaveBeenCalledWith({
        market: 'somemarket',
        isSubproduct: false,
      })
    })

    it('should return a query with all subproducts', async () => {
      await service.getAllProducts({
        subproducts: true,
        market: null,
      })

      expect(productModelMock.find).toHaveBeenCalledWith({
        isSubproduct: true,
      })
    })
  })

  describe('#getSingle', () => {
    it('should find the doc by id', async () => {
      try {
        const res = await service.getSingle(ProductMock.id)
        expect(productModelMock.findById).toHaveBeenCalledWith(ProductMock.id)
        expect(productModelMock.doc.populate).toHaveBeenCalledTimes(3)

        expect(productModelMock.findOne).not.toHaveBeenCalled()
        expect(res.id).toEqual(ProductMock.id)
        expect(res.name).toEqual(ProductMock.name)
      } catch (error) {
        fail(`unexpected code path: ${error.message}`)
      }
    })

    it('should find the doc by productID', async () => {
      try {
        const res = await service.getSingle(ProductMock.productID)
        expect(productModelMock.findById).not.toHaveBeenCalled()
        expect(productModelMock.findOne).toHaveBeenCalledWith({
          productID: ProductMock.productID,
        })
        expect(productModelMock.doc.populate).toHaveBeenCalledTimes(3)
        expect(res.productID).toEqual(ProductMock.productID)
        expect(res.name).toEqual(ProductMock.name)
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
      productModelMock.findOne = jest.fn().mockResolvedValue(null)

      await service.importProduct(QuikProducMock)

      expect(productModelMock.create).toHaveBeenCalled()
      expect(productModelMock.findOne).toHaveBeenCalled()
    })

    it('should update an already created product', async () => {
      await service.importProduct(QuikProducMock)

      expect(productModelMock.create).not.toHaveBeenCalled()
      expect(productModelMock.findOne).toHaveBeenCalled()
      expect(productModelMock.doc.updateOne).toHaveBeenCalled()
    })

    it('should update an already created product and update the productID', async () => {
      await service.importProduct(QuikProducMock)

      const prodID = productModelMock.doc.updateOne.mock.calls[0][0].productID
      expect(productModelMock.create).not.toHaveBeenCalled()
      expect(productModelMock.findOne).toHaveBeenCalled()
      expect(productModelMock.doc.updateOne).toHaveBeenCalled()
      expect(prodID).toEqual(QuikProducMock.productID)
    })

    it('should not update a main product if the infoming is a subproduct', async () => {
      const dto = { ...QuikProducMock, isSubproduct: true }

      await service.importProduct(dto)

      expect(productModelMock.create).not.toHaveBeenCalled()
      expect(productModelMock.findOne).toHaveBeenCalled()
      expect(productModelMock.doc.updateOne).not.toHaveBeenCalled()
    })
  })

  describe('#importSubproducts', () => {
    it('should add all options as products', async () => {
      productModelMock.findOne = jest.fn().mockResolvedValue(null)
      mockOptionModel.mockImplementation((item) => ({
        type: item.type,
        label: item.label,
        iterable: item.iterable,
        usesPrice: Boolean(item.usesPrice),
        required: item.required,
        elements: item.elements,
      }))

      const res = await service.importSubproducts(QuikProducMock.options[0])

      expect(productModelMock.create).toHaveBeenCalledTimes(4)
      expect(mockOptionModel).toHaveBeenCalled()

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
      productModelMock.deleteMany = jest.fn()
    })
  })
})
