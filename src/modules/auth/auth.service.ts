import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  generateToken(userId: string) {
    const accessToken = this.jwtService.sign(
      { sub: userId },
      { expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '1d') }
    );
    
    const refreshToken = this.jwtService.sign(
      { sub: userId },
      { expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d') }
    );
    
    return { accessToken, refreshToken };
  }

  verifyToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      return null;
    }
  }

  setRefreshTokenCookie(response: Response, refreshToken: string) {
    // const isProduction = this.configService.get('NODE_ENV') === 'production';
    
    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  clearTokenCookie(response: Response) {
    response.clearCookie('access_token');
    response.clearCookie('refresh_token');
  }
}
