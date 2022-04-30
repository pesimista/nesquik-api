import { Test, TestingModule } from '@nestjs/testing'
import { CategoriesService } from '../providers/categories.service'
import { CategoriesController } from './categories.controller'

describe('CategoriesController', () => {
  let controller: CategoriesController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [{ provide: CategoriesService, useValue: {} }],
    }).compile()

    controller = module.get<CategoriesController>(CategoriesController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
