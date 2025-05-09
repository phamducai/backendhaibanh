import { Injectable } from '@nestjs/common';
import { CreateUserproductDto } from './dto/create-userproduct.dto';
import { UpdateUserproductDto } from './dto/update-userproduct.dto';

@Injectable()
export class UserproductsService {
  create(createUserproductDto: CreateUserproductDto) {
    return 'This action adds a new userproduct';
  }

  findAll() {
    return `This action returns all userproducts`;
  }

  findOne(id: number) {
    return `This action returns a #${id} userproduct`;
  }

  update(id: number, updateUserproductDto: UpdateUserproductDto) {
    return `This action updates a #${id} userproduct`;
  }

  remove(id: number) {
    return `This action removes a #${id} userproduct`;
  }
}
