import { Test, TestingModule } from '@nestjs/testing'
import { CategoriesService } from '../../categories/providers/categories.service'
import { MarketsService } from '../../markets/providers/markets.service'
import { ProductsService } from '../providers/products.service'
import { ProductsController } from './products.controller'

describe('ProductsController', () => {
  let controller: ProductsController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        { provide: MarketsService, useValue: jest.fn() },
        { provide: CategoriesService, useValue: jest.fn() },
        { provide: ProductsService, useValue: jest.fn() },
      ],
    }).compile()

    controller = module.get<ProductsController>(ProductsController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
