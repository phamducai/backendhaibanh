import { Injectable } from '@nestjs/common';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class LessonsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createLessonDto: CreateLessonDto, file?: Express.Multer.File) {
    let videoUrl = createLessonDto.videourl;
    if (file) {
      videoUrl = `api/v1/lessons/videos/${file.filename}`;
    }
    return this.prisma.lessons.create({
      data: {
        ...createLessonDto,
        lessonid: uuidv4(),
        videourl: videoUrl,
      },
    });
  }

  findAll(productid?: string, chapterid?: string) {
    // Prepare where clause with base condition
    const whereClause: any = {
      isdeleted: false
    };
    
    // Only add filters if parameters have values
    if (productid) {
      whereClause.productid = productid;
    }
    
    if (chapterid) {
      whereClause.chapterid = chapterid;
    }
    
    return this.prisma.lessons.findMany({
      where: whereClause,
      orderBy: [
        { displayorder: "asc" },
        { createdat: "desc" }
      ],
      include: {
        chapters: {
          select: {
            chaptername: true
          }
        }
      }
    });
  }

  findOne(id: string) {
    return this.prisma.lessons.findUnique({
      where: { lessonid: id },
    });
  }

  update(id: string, updateLessonDto: UpdateLessonDto) {
    return this.prisma.lessons.update({
      where: { lessonid: id },
      data: updateLessonDto,
    });
  }

  remove(id: string) {
    return this.prisma.lessons.delete({
      where: { lessonid: id },
    });
  }
}
