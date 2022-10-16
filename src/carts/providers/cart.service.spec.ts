import { getModelToken } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import { LoggerMock } from '../../../test/mocks/logger.mock'
import { ModelMock, ModelMockType } from '../../../test/mocks/mongoose.mock'
import { Cart, CartOrder } from '../../utils/schemas/carts.schema'
// import { ProductOption } from '../../../utils/schemas/product.schema'

import { CartService } from './cart.service'

const CartMock: Cart = {
  user: 'someuser',
  address: null,
  total: 0,
  orders: [],
}

describe('CartService', () => {
  let service: CartService
  let cartModelMock: ModelMockType
  // let orderModelMock: jest.Mock

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: 'winston', useValue: LoggerMock },
        {
          provide: getModelToken(Cart.name),
          useValue: ModelMock([CartMock]),
        },
        {
          provide: getModelToken(CartOrder.name),
          useValue: jest.fn(),
        },
      ],
    }).compile()

    service = module.get<CartService>(CartService)
    cartModelMock = module.get<ModelMockType>(getModelToken(Cart.name))
    // orderModelMock = module.get<jest.Mock>(getModelToken(CartOrder.name))
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('#getSingle', () => {
    it('should return an already existing user cart', async () => {
      const res = await service.getSingle('someuser')

      expect(res.user).toEqual(CartMock.user)
      expect(cartModelMock.findOne).toHaveBeenCalledWith({
        userID: CartMock.user,
      })
    })
  })

  describe('#createCart', () => {
    it('should create the user cart and return it', async () => {
      const res = await service.createCart('someuser')

      expect(res.user).toEqual(CartMock.user)
      expect(cartModelMock.create).toHaveBeenCalled()
    })
  })
})
