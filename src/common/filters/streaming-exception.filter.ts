import { ExceptionFilter, Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class StreamingExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(StreamingExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Check if this is a streaming-related error
    if (this.isStreamingError(exception)) {
      // Log at debug level for streaming errors as they're usually client-side disconnects
      this.logger.debug(`Streaming error: ${exception.code || exception.message}`);
      
      // Don't send response if headers already sent or connection closed
      if (!response.headersSent && !response.destroyed) {
        try {
          response.status(499).end(); // 499 Client Closed Request
        } catch (err) {
          // Response might already be closed, ignore
        }
      }
      return;
    }

    // For non-streaming errors, log as error
    this.logger.error(
      `${request.method} ${request.url} - ${exception.message}`,
      exception.stack
    );

    // Handle other errors normally
    if (!response.headersSent && !response.destroyed) {
      try {
        response.status(500).json({
          statusCode: 500,
          timestamp: new Date().toISOString(),
          path: request.url,
          method: request.method,
          message: 'Internal server error'
        });
      } catch (err) {
        // Response might already be closed, ignore
      }
    }
  }

  private isStreamingError(exception: any): boolean {
    const streamingErrorCodes = [
      'ERR_STREAM_PREMATURE_CLOSE',
      'ECONNRESET',
      'EPIPE',
      'ECONNABORTED',
      'ERR_STREAM_DESTROYED'
    ];

    return streamingErrorCodes.includes(exception.code) ||
           (exception.message && streamingErrorCodes.some(code => 
             exception.message.includes(code)
           ));
  }
} 