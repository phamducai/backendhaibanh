import { PartialType } from '@nestjs/mapped-types';
import { CreateUserproductDto } from './create-userproduct.dto';

export class UpdateUserproductDto extends PartialType(CreateUserproductDto) {}
