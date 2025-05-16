import { Injectable } from '@nestjs/common';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../database/prisma.service';
import { getVideoDurationInSeconds } from 'get-video-duration';
import { join } from 'path';

@Injectable()
export class LessonsService {
  constructor(private readonly prisma: PrismaService) {}

  // Hàm lấy thời lượng video
  private async getVideoDuration(filePath: string): Promise<string | null> {
    try {
      const durationInSeconds = await getVideoDurationInSeconds(filePath);
      const minutes = Math.floor(durationInSeconds / 60);
      const seconds = Math.floor(durationInSeconds % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    } catch (error) {
      console.error('Error getting video duration:', error);
      return null;
    }
  }

  async create(createLessonDto: CreateLessonDto, file?: Express.Multer.File) {
    let videoUrl = createLessonDto.videourl;
    let duration: string | null = null;
    
    if (file) {
      videoUrl = `api/v1/lessons/videos/${file.filename}`;
      
      // Nếu là video, lấy thời lượng
      if (file.mimetype.startsWith('video/')) {
        try {
          const filePath = join(process.cwd(), file.path);
          duration = await this.getVideoDuration(filePath);
          console.log('Video duration:', duration);
        } catch (error) {
          console.error('Error extracting video duration:', error);
        }
      }
    }
    console.log("hello")
    return this.prisma.lessons.create({
      data: {
        ...createLessonDto,
        lessonid: uuidv4(),
        videourl: videoUrl,
        duration: duration,
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
