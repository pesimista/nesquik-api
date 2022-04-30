import { Type } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator'
import { Coordinates, MarketImages } from 'nesquik-types'
import { Market } from '../../utils/schemas/market.schema'

class ImagesDto implements MarketImages {
  @IsString()
  profile: string

  @IsString()
  header: string

  @IsString()
  showcaseBackgroundImage: string

  @IsString()
  backgroundImage: string

  @IsArray()
  marketing: string[]

  @IsString()
  headerBackgroundColor: string
}

export class PostMarketDto implements Partial<Market> {
  @IsOptional()
  @IsNumber()
  bikeDistance: number

  @IsOptional()
  @IsBoolean()
  hasFreeDelivery: boolean

  @IsOptional()
  @IsBoolean()
  hasPromo: boolean

  @IsOptional()
  @IsBoolean()
  isOnlyQuik: boolean

  @IsOptional()
  @IsNumber()
  maxDeliveryRange: number

  @IsOptional()
  @IsNumber()
  radiusDistance: number

  @IsOptional()
  @IsNumber()
  order: number

  @IsOptional()
  @IsNumber()
  rating: number

  // schedule: Partial<Schedule>[]
  // marketing: Banner[]

  @Type(() => ImagesDto)
  @IsNotEmpty()
  images: MarketImages

  @IsArray()
  categoriesIds: string[]

  @IsNotEmpty()
  @IsString()
  address: string

  @IsString()
  @IsOptional()
  addressID: string

  @IsNotEmpty()
  @IsString()
  addressName: string

  @IsNotEmpty()
  coordinates: Coordinates

  @IsOptional()
  @IsString()
  email: string

  @IsNotEmpty()
  @IsNumber()
  estimatedTime: number

  @IsNotEmpty()
  @IsString()
  logo: string

  @IsNotEmpty()
  @IsString()
  marketID: string

  @IsNotEmpty()
  @IsString()
  name: string

  @IsNotEmpty()
  @IsString()
  status: string
}
