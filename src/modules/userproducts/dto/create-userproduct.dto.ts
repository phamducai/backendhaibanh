import { IsUUID, IsOptional, IsBoolean, IsString } from 'class-validator';

export class CreateUserProductDto {

  @IsUUID()
  productid: string;

  @IsBoolean()
  @IsOptional()
  isdeleted?: boolean;

  @IsBoolean()
  status: boolean;
  
  @IsString()
  amount: string;
    
  @IsString()
  @IsOptional()
  transactionid?: string;
}