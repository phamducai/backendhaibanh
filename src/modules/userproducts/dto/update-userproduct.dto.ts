import { PartialType } from '@nestjs/mapped-types';
import { CreateUserProductDto } from './create-userproduct.dto';

export class UpdateUserproductDto extends PartialType(CreateUserProductDto) {}
