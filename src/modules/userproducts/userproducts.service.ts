import { Injectable } from '@nestjs/common';
import { CreateUserProductDto } from './dto/create-userproduct.dto';
import { UpdateUserproductDto } from './dto/update-userproduct.dto';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../database/prisma.service'


@Injectable()
export class UserproductsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createUserProductDto: CreateUserProductDto) {
    return this.prisma.userproducts.create({
      data: {
        ...createUserProductDto,
        userproductid: uuidv4(),
      },
    });
  }

  findAll() {
    return this.prisma.userproducts.findMany();
  }

  findOne(id: string) {
    return this.prisma.userproducts.findUnique({
      where: { userproductid: id },
    });
  }

  update(id: string, updateUserProductDto: UpdateUserproductDto) {
    return this.prisma.userproducts.update({
      where: { userproductid: id },
      data: updateUserProductDto,
    });
  }

  remove(id: string) {
    return this.prisma.userproducts.delete({
      where: { userproductid: id },
    });
  }
}
