import { Injectable } from '@nestjs/common';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class LessonsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createLessonDto: CreateLessonDto) {
    return this.prisma.lessons.create({
      data: {
        ...createLessonDto,
        lessonid: uuidv4(),
      },
    });
  }

  findAll() {
    return this.prisma.lessons.findMany();
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
