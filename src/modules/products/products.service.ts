import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../database/prisma.service';


@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createProductDto: CreateProductDto) {
    return this.prisma.products.create({
      data: {
        ...createProductDto,
        productid: uuidv4(),
      },
    });
  }

  findAll() {
    return this.prisma.products.findMany();
  }

  findOne(id: string) {
    return this.prisma.products.findUnique({
      where: { productid: id },
    });
  }

  update(id: string, updateProductDto: UpdateProductDto) {
    return this.prisma.products.update({
      where: { productid: id },
      data: updateProductDto,
    });
  }

  remove(id: string) {
    return this.prisma.products.delete({
      where: { productid: id },
    });
  }
}
