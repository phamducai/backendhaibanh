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
    console.log(file)
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
    // Validate filename to prevent path traversal attacks
    if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      res.status(400).send('Invalid filename');
      return;
    }

    // Clean up the filename to ensure it's just the base filename
    const safeFilename = path.basename(filename);
    console.log(`Streaming video: ${safeFilename}`);
    
    // Define relative paths - cached for better performance
    const UPLOAD_PATHS = ['uploads', 'uploads/videos'];
    let videoPath: string | null = null;
    let foundInPath: string | null = null;
    
    // Try to find the video in any of the defined paths (with path.resolve for cross-platform safety)
    for (const dir of UPLOAD_PATHS) {
      const testPath = path.resolve(dir, safeFilename);
      
      try {
        // Use async stat instead of existsSync for better performance
        await this.statAsync(testPath);
        videoPath = testPath;
        foundInPath = dir;
        break;
      } catch (err) {
        // Path doesn't exist or isn't accessible, continue to next path
      }
    }
    
    // If video wasn't found, return available options
    if (!videoPath) {
      console.error(`Video not found: ${safeFilename}`);
      
      // List available videos for troubleshooting
      const availableVideos: {[path: string]: string[]} = {};
      
      for (const dir of UPLOAD_PATHS) {
        try {
          if (fs.existsSync(dir)) {
            availableVideos[dir] = fs.readdirSync(dir)
              .filter(file => file.endsWith('.mp4'));
          }
        } catch (err) {
          console.error(`Error reading directory ${dir}:`, err);
        }
      }
      
      // Format available videos for error message
      const availableOptions = Object.entries(availableVideos)
        .filter(([_, files]) => files.length > 0)
        .map(([dir, files]) => `${dir}: ${files.join(', ')}`)
        .join(' | ');
      
      const errorMsg = `Video not found: ${safeFilename}. ${availableOptions ? 'Available videos: ' + availableOptions : 'No videos available.'}`;
      res.status(404).send(errorMsg);
      return;
    }
    
    try {
      // Get file stats for streaming
      const stats = await this.statAsync(videoPath);
      const fileSize = stats.size;
      const mimeType = 'video/mp4';
      const range = res.req.headers.range;

      // Set common headers for both range and full requests
      const commonHeaders = {
        'Accept-Ranges': 'bytes',
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Last-Modified': stats.mtime.toUTCString(),
        'ETag': `"${Buffer.from(path.basename(videoPath) + stats.mtime.toISOString()).toString('base64')}"`,
      };

      // Handle range request (partial content) or full file
      if (range) {
        // Parse Range header
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        
        // Validate start range
        if (isNaN(start) || start < 0 || start >= fileSize) {
          res.status(416).set({
            'Content-Range': `bytes */${fileSize}`,
            ...commonHeaders,
          }).send('Range Not Satisfiable');
          return;
        }
        
        // Determine end position and handle maximum chunk size
        const MAX_CHUNK_SIZE = 2 * 1024 * 1024; // 2MB maximum chunk size to prevent memory issues
        const end = parts[1] ? Math.min(parseInt(parts[1], 10), fileSize - 1) : Math.min(start + MAX_CHUNK_SIZE, fileSize - 1);
        const chunkSize = (end - start) + 1;
        
        // Set partial content headers
        res.status(206).set({
          ...commonHeaders,
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Content-Length': chunkSize,
        });
        
        // Only log ranges for debugging if they're not the default range
        if (start > 0 || end < fileSize - 1) {
          console.log(`Streaming range: bytes ${start}-${end}/${fileSize}`);
        }
        
        const file = createReadStream(videoPath, { start, end, highWaterMark: 64 * 1024 }); // 64KB buffer
        this.setupStreamEventHandlers(file);
        return new StreamableFile(file);
      } else {
        // Full content response
        res.status(200).set({
          ...commonHeaders,
          'Content-Length': fileSize,
        });
        
        console.log(`Streaming full video: ${safeFilename} (${Math.round(fileSize/1024/1024 * 100) / 100}MB)`);
        const file = createReadStream(videoPath, { highWaterMark: 64 * 1024 }); // 64KB buffer
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
        // These errors are normal when clients seek the video or close the browser
        // Just log at debug level not to flood the logs
        console.log('Client disconnected, stream closed');
      } else {
        console.error(`Stream error: ${err.message}`);
      }
    });
    
    // Only add these in development environment or when debugging is needed
    if (process.env.NODE_ENV !== 'production') {
      stream.on('open', () => console.log('Stream opened'));
      stream.on('end', () => console.log('Stream complete'));
    }
    
    // Ensure stream is destroyed on end to prevent memory leaks
    stream.on('end', () => {
      if (!stream.destroyed) {
        stream.destroy();
      }
    });
  }
}
