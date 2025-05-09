import { Injectable } from '@nestjs/common';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../database/prisma.service';
@Injectable()
export class ChaptersService {
  constructor(private readonly prisma: PrismaService) {}

  create(createChapterDto: CreateChapterDto) {
    return this.prisma.chapters.create({
      data: {
        ...createChapterDto,
        chapterid: uuidv4(),
      },
    });
  }

  findAll() {
    return this.prisma.chapters.findMany();
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
    return this.prisma.chapters.delete({
      where: { chapterid: id },
    });
  }
}
