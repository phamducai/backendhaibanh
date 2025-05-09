import { IsString, IsBoolean, IsOptional, IsNumber, IsUrl, IsUUID, IsNotEmpty, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsUUID()
  productid: string;

  @IsString()
  @IsNotEmpty()
  productname: string;

  @IsBoolean()
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

  @IsUrl()
  @IsOptional()
  imageurl?: string;

  @IsUrl()
  @IsOptional()
  downloadurl?: string;

  @IsBoolean()
  @IsOptional()
  isactive?: boolean;

  @IsBoolean()
  @IsOptional()
  isdeleted?: boolean;
}