import { Body, Controller, Get, Post } from '@nestjs/common'
import { PostCategoryDto } from '../dto/postCategory.dto'
import { CategoriesService } from '../providers/categories.service'
import { Category } from '../schemas/categories.schema'

@Controller('categories')
export class CategoriesController {
  constructor(private service: CategoriesService) {}

  @Get()
  async findAll(): Promise<Category[]> {
    try {
      return this.service.getAll()
    } catch (error) {
      console.error(error)
    }
  }

  @Post()
  async createCategory(@Body() dto: PostCategoryDto): Promise<Category> {
    try {
      return this.service.createOrUpdate(dto)
    } catch (error) {
      console.error(error)
      throw error
    }
  }
}
