import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Lấy token từ Authorization header
    let token = request.headers.authorization;
    if (!token) {
      throw new UnauthorizedException('Access token not found');
    }
    
    // Remove 'Bearer ' prefix if it exists
    if (token.includes('Bearer')) {
      token = token.split('Bearer ')[1];
    }
    
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET')
      });
      
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
