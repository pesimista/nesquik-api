import { Body, Controller, Get, Post } from '@nestjs/common'
import { PostMarketDto } from '../dto/postMarket.dto'
import { MarketsService } from '../providers/markets.service'
import { Market } from '../schemas/market.schema'

@Controller('markets')
export class MarketsController {
  constructor(private service: MarketsService) {}

  @Get()
  async findAll(): Promise<Market[]> {
    try {
      return this.service.getAll()
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  @Post()
  async createMarket(@Body() dto: PostMarketDto): Promise<Market> {
    try {
      return this.service.createOrUpdate(dto)
    } catch (error) {
      console.error(error)
      throw error
    }
  }
}
