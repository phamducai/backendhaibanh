import { IsString, IsUUID, IsOptional, IsBoolean } from 'class-validator';

export class CreateUserProductDto {
  @IsUUID()
  userproductid: string;

  @IsUUID()
  userid: string;

  @IsUUID()
  productid: string;

  @IsBoolean()
  @IsOptional()
  isdeleted?: boolean;
}