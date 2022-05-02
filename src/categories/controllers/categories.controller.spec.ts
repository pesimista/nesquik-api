import { Test, TestingModule } from '@nestjs/testing'
import { AppConfigService } from '../../config/providers/configuration.service'
import { CategoriesService } from '../providers/categories.service'
import { CategoriesController } from './categories.controller'

describe('CategoriesController', () => {
  let controller: CategoriesController

  const AppConfigServiceMock = {
    defaultParentCategory: 'defaultValue',
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        { provide: CategoriesService, useValue: {} },
        { provide: AppConfigService, useValue: AppConfigServiceMock },
      ],
    }).compile()

    controller = module.get<CategoriesController>(CategoriesController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
