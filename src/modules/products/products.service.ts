import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../database/prisma.service';
import { join } from 'path';
import * as fs from 'fs';


@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}
  
  private readonly uploadDir = join(process.cwd(), 'uploads/images');

  async create(createProductDto: CreateProductDto, file?: Express.Multer.File) {
    const productId = uuidv4();
    let imageUrl = createProductDto.imageurl;
    if (file) {
      imageUrl = `api/v1/products/images/${file.filename}`;
    }
    
    return this.prisma.products.create({
      data: {
        ...createProductDto,
        productid: productId,
        imageurl: imageUrl,
      },
    });
  }

  findAll(isCourse?: boolean) {
    // Create base where clause with required condition
    const whereClause: any = {
      isdeleted: false
    };
    
    // Only add iscourse filter when parameter is defined
    if (isCourse !== undefined) {
      whereClause.iscourse = isCourse;
    }
    
    // Make a single query with the dynamic where clause
    return this.prisma.products.findMany({
      where: whereClause
    });
  }

  findOne(id: string) {
    return this.prisma.products.findUnique({
      where: { 
        productid: id,
        isdeleted:false
       },
    });
  }

  update(id: string, updateProductDto: UpdateProductDto) {
    return this.prisma.products.update({
      where: { 
        productid: id,
        isdeleted:false
       },
      data: updateProductDto,
    });
  }

  remove(id: string) {
    return this.prisma.products.update({
      where: { productid: id },
      data: {
        isdeleted:true
      },
    });
  }

  async uploadImage(id: string, file: Express.Multer.File) {
    // Check if product exists
    const product = await this.prisma.products.findUnique({
      where: { 
        productid: id,
        isdeleted:false
       },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Generate the file URL
    const fileUrl = `api/v1/products/images/${file.filename}`;

    // Update the product with the new image URL
    return this.prisma.products.update({
      where: { 
        productid: id,
        isdeleted:false
       },
      data: { imageurl: fileUrl },
    });
  }

  async getImage(filename: string) {
    const filePath = join(this.uploadDir, filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Image not found');
    }

    return {
      stream: fs.createReadStream(filePath),
      type: this.getContentType(filename),
    };
  }

  private getContentType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp'
    };
    
    return mimeTypes[ext] || 'application/octet-stream';
  }

  count(isCourse?: boolean) {
    return this.prisma.products.count({
      where: {
        iscourse: isCourse,
        isdeleted:false
      },
    });
  }

  async getProductByUerid(userid:string){
    const products = await this.prisma.products.findMany({
      where: {
        isdeleted: false,
        productid: {
          notIn: await this.prisma.userproducts.findMany({
            where: {
              userid: userid,
              status: true,
            },
            select: {
              productid: true,
            },
          }).then(results => results.map(r => r.productid))
        }
      }
    });
    return products;
  }
}
