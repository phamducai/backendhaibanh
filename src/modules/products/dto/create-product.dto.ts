import { IsString, IsBoolean, IsOptional, IsNumber, IsNotEmpty, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateProductDto {

  @IsString()
  @IsNotEmpty()
  productname: string;

  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  iscourse: boolean;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  regularprice: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  saleprice?: number;

  @IsString()
  @IsOptional()
  imageurl?: string;

  @IsOptional()
  downloadurl?: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isactive?: boolean;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isdeleted?: boolean;
}