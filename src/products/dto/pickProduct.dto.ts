import { Type } from 'class-transformer'
import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator'
import { OptionValues } from 'nesquik-types'

export class OptionValuesDto implements OptionValues {
  @IsNotEmpty()
  @IsString()
  elementID: string

  @IsNotEmpty()
  @IsNumber()
  quantity: number
}

export class PickProductOptionsDto {
  @IsNotEmpty()
  @IsString()
  id: string

  @IsArray()
  @Type(() => OptionValuesDto)
  selected: OptionValuesDto[]
}

export class PickProductDto {
  @IsNotEmpty()
  @IsString()
  productID: string

  @IsNotEmpty()
  @IsNumber()
  quantity: number

  @IsArray()
  @Type(() => PickProductOptionsDto)
  options: PickProductOptionsDto[]
}
