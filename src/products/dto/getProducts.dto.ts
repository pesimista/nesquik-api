import { Transform } from 'class-transformer'
import { IsBoolean, IsOptional, IsString } from 'class-validator'

export class GetAllProductsDto {
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  subproducts?: boolean

  @IsOptional()
  @IsString()
  market: string
}
