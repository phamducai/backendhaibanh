import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Res, HttpStatus, StreamableFile, Query } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileStorageConfig } from 'src/config/file-storage.config';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { createReadStream, stat } from 'fs';
import { promisify } from 'util';

@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}
  
  private statAsync = promisify(stat);

  @Post()
  @UseInterceptors(FileInterceptor('file', fileStorageConfig))
  create(@Body() createLessonDto: CreateLessonDto, @UploadedFile() file?: Express.Multer.File) {
    return this.lessonsService.create(createLessonDto, file);
  }

  @Get()
  findAll(@Query('productid') productid?: string, @Query('chapterid') chapterid?: string) {
    return this.lessonsService.findAll(productid, chapterid);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lessonsService.findOne(id);
  }
   


  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLessonDto: UpdateLessonDto) {
    return this.lessonsService.update(id, updateLessonDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.lessonsService.remove(id);
  }

  @Get('download/:filename')
  async downloadVideo(@Param('filename') filename: string, @Res() res: Response) {
    let videoPath = path.join(process.cwd(), 'uploads', filename);
        if (!fs.existsSync(videoPath)) {
      videoPath = path.join(process.cwd(), 'uploads', 'videos', filename);
      if (!fs.existsSync(videoPath)) {
        return res.status(404).send('Video not found');
      }
    }
    
    try {
      const stat = fs.statSync(videoPath);
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Content-Length', stat.size);
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      const fileStream = fs.createReadStream(videoPath);
      
      fileStream.on('error', (error) => {
        console.error(`Error streaming file: ${error.message}`);
        if (!res.headersSent) {
          res.status(500).send('Error streaming file');
        }
      });
      
      // Pipe stream tới response
      return fileStream.pipe(res);
    } catch (err) {
      console.error('Error preparing download:', err);
      return res.status(500).send('Error preparing download');
    }
  }
  
  @Get('videos/:filename')
  async streamVideo(@Param('filename') filename: string, @Res({ passthrough: true }) res: Response) {
    console.log(`Streaming video: ${filename}`);
    
    // Define relative paths - no longer using process.cwd()
    const UPLOAD_PATHS = ['uploads', 'uploads/videos'];
    let videoPath: string | null = null;
    
    // Try to find the video in any of the defined paths
    for (const dir of UPLOAD_PATHS) {
      const testPath = `./${dir}/${filename}`;
      console.log(`Checking path: ${testPath}`);
      
      if (fs.existsSync(testPath)) {
        videoPath = testPath;
        console.log(`Video found in: ${dir}`);
        break;
      }
    }
    
    // If video wasn't found, return available options
    if (!videoPath) {
      console.error(`Video not found: ${filename}`);
      
      // List available videos for troubleshooting
      const availableVideos: {[path: string]: string[]} = {};
      
      for (const dir of UPLOAD_PATHS) {
        if (fs.existsSync(`./${dir}`)) {
          availableVideos[dir] = fs.readdirSync(`./${dir}`)
            .filter(file => file.endsWith('.mp4'));
          
          console.log(`Videos in ${dir}:`, availableVideos[dir].join(', '));
        }
      }
      
      // Format available videos for error message
      const availableOptions = Object.entries(availableVideos)
        .filter(([_, files]) => files.length > 0)
        .map(([dir, files]) => `${dir}: ${files.join(', ')}`)
        .join(' | ');
      
      const errorMsg = `Video not found: ${filename}. ${availableOptions ? 'Available videos: ' + availableOptions : 'No videos available.'}`;
      res.status(404).send(errorMsg);
      return;
    }
    
    try {
      // Get file stats for streaming
      const stats = await this.statAsync(videoPath);
      const fileSize = stats.size;
      console.log(`File size: ${fileSize} bytes`);
      const range = res.req.headers.range;

      // Handle range request (partial content) or full file
      if (range) {
        // Parse Range header
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunkSize = (end - start) + 1;
        
        // Set partial content headers
        res.status(206).set({
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize,
          'Content-Type': 'video/mp4',
        });
        
        console.log(`Streaming range: bytes ${start}-${end}/${fileSize}`);
        const file = createReadStream(videoPath, { start, end });
        this.setupStreamEventHandlers(file);
        return new StreamableFile(file);
      } else {
        // Full content response
        res.set({
          'Content-Length': fileSize,
          'Content-Type': 'video/mp4',
          'Accept-Ranges': 'bytes',
        });
        
        console.log('Streaming full video');
        const file = createReadStream(videoPath);
        this.setupStreamEventHandlers(file);
        return new StreamableFile(file);
      }
    } catch (err) {
      console.error('Error streaming video:', err);
      res.status(500).send(`Error streaming video: ${err.message}`);
    }
  }
  
  // Helper method to set up stream event handlers
  private setupStreamEventHandlers(stream: fs.ReadStream): void {
    // Handle common stream errors
    stream.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'ECONNRESET' || err.code === 'ERR_STREAM_PREMATURE_CLOSE') {
        console.log('Client disconnected, stream closed');
      } else {
        console.error(`Stream error: ${err.message}`);
      }
    });
    
    // Add event listeners for debugging
    stream.on('open', () => console.log('Stream opened'));
    stream.on('end', () => console.log('Stream complete'));
  }
}
