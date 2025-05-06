import { Injectable } from '@nestjs/common';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../database/prisma.service';
@Injectable()
export class ChaptersService {
  constructor(private readonly prisma: PrismaService) {}

  create(createChapterDto: CreateChapterDto) {
   const course=this.prisma.products.findUnique({
    where:{
      productid:createChapterDto.productid,
      iscourse:true,
      isdeleted:false
    }
   })
   if(!course){
    throw new Error('Course not found');
   }
    const chapterId = uuidv4();
    return this.prisma.chapters.create({
      data: {
        ...createChapterDto,
        chapterid: chapterId,
      },
    });
  }

  findAll(productId?: string) {
    if (productId) {
      return this.prisma.chapters.findMany(
        {
          where:{
            productid:productId,
            isdeleted:false
          },
          orderBy: [
            { displayorder: "asc" },
            { createdat: "desc" }
          ]
        }
      );
    }
    return this.prisma.chapters.findMany(
      {
        where:{
          isdeleted:false
        }
      }
    );
  }

  findOne(id: string) {
    return this.prisma.chapters.findUnique({
      where: { chapterid: id },
    });
  }

  update(id: string, updateChapterDto: UpdateChapterDto) {
    return this.prisma.chapters.update({
      where: { chapterid: id },
      data: updateChapterDto,
    });
  }

  remove(id: string) {
    return this.prisma.chapters.update({
      where: { chapterid: id },
      data: {
        isdeleted:true
      },
    });
  }
}
