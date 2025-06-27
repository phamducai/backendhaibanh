import { Injectable } from '@nestjs/common';
import { UpdateUserproductDto } from './dto/update-userproduct.dto';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../database/prisma.service'
import { CreateUserProductDto } from './dto/create-userproduct.dto';


@Injectable()
export class UserproductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserProductDto: CreateUserProductDto, user?: any) {
    const createData: any = {
      userproductid: uuidv4(),
      userid: user?.sub,
      productid: createUserProductDto.productid,
      status: createUserProductDto.status,
      amount: createUserProductDto.amount,
      isdeleted: createUserProductDto.isdeleted || false,
    };
    
    // Only add transactionid if it's provided and not undefined
    if (createUserProductDto.transactionid) {
      createData.transactionid = createUserProductDto.transactionid;
    }
    
    // Create a clean object for update operation
    const updateData: any = {
      amount: createUserProductDto.amount,
      status: createUserProductDto.status,
      isdeleted: createUserProductDto.isdeleted || false,
    };
    
    // Only add transactionid to update if it's provided
    if (createUserProductDto.transactionid) {
      updateData.transactionid = createUserProductDto.transactionid;
    }
    
    return this.prisma.userproducts.upsert({
      where: {
        userid_productid: {
          userid: user?.sub,
          productid: createUserProductDto.productid
        }
      },
      update: updateData,
      create: createData,
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

  findUserProductByUserId(id: string, status?: boolean,iscourse?:boolean) {
    return this. prisma.userproducts.findMany({
      where: {
        userid: id,
        status: status,
        isdeleted: false,
        products: {
          iscourse: iscourse
        }
      },
      select: {
        userproductid: true,
        userid: true,
        productid: true,
        purchasedate: true,
        isdeleted: true,
        amount: true,
        transactionid: true,
        status: true,
        created_at: true,
        updated_at: true,
        products: true
      }
    });
  }

  // Cách 1: Sử dụng raw query (khuyến nghị vì amount là string)
  async getTotalAmountByStatus() {
    console.log("getTotalAmountByStatus");
    const result = await this.prisma.$queryRaw<Array<{ total: number | null }>>`
      SELECT SUM(CAST(amount AS INT)) as total 
      FROM userproducts 
      WHERE status = true
    `;
    return result[0]?.total || 0;
  }
}
