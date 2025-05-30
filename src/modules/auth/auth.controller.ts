import { Controller, Post, Get, Body, Res, UseGuards, Request, Req, UnauthorizedException } from '@nestjs/common';
import { Response, Request as ExpressRequest } from 'express';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthenticationDto } from '../users/dto/authentication.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('google')
  async googleAuth(@Body() userData: CreateUserDto, @Res({ passthrough: true }) response: Response) {
    // Tìm hoặc tạo user từ Google data
    const user = await this.usersService.findOrCreateByGoogle(userData);
    
    // Tạo JWT token
    const tokens = this.authService.generateToken(user.userid);
    
    // Lưu refresh token vào HTTP cookie (access token sẽ được trả về trong response)
    this.authService.setRefreshTokenCookie(response, tokens.refreshToken);
    
    // Trả về thông tin user và access token
    return {
      accessToken: tokens.accessToken,
      user: {
        id: user.userid,
        email: user.email,
        avatarUrl: user.avatar,
        fullname:user.fullname  
      }
    };
  }

  @Post('register')
  async register(@Body() registerDto: AuthenticationDto, @Res({ passthrough: true }) response: Response) {
    const user = await this.usersService.register(registerDto);
    
    // Tạo JWT token
    const tokens = this.authService.generateToken(user.userid);
    
    // Lưu refresh token vào HTTP cookie (access token sẽ được trả về trong response)
    this.authService.setRefreshTokenCookie(response, tokens.refreshToken);
    
    // Trả về thông tin user và access token
    return {
      accessToken: tokens.accessToken,
      user: {
        id: user.userid,
        email: user.email,
        avatarUrl: user.avatar,
        fullname:user.fullname,
      }
    };
  }

  @Post('login')
  async login(@Body() loginDto: AuthenticationDto, @Res({ passthrough: true }) response: Response) {
    
    // Xác thực user bằng email và password
    const user = await this.usersService.validateUser(loginDto);
    
    // Tạo JWT token
    const tokens = this.authService.generateToken(user.userid);
    
    // Lưu refresh token vào HTTP cookie (access token sẽ được trả về trong response)
    this.authService.setRefreshTokenCookie(response, tokens.refreshToken);
    
    // Trả về thông tin user và access token
    return {
      accessToken: tokens.accessToken,
      user: {
        id: user.userid,
        email: user.email,
        avatarUrl: user.avatar,
        fullname:user.fullname
      }
    };
  }

  @Post('refresh')
  async refreshToken(@Req() request: ExpressRequest, @Res({ passthrough: true }) response: Response) {
    const refreshToken = request.cookies['refresh_token'];
    
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }
    
    // Verify refresh token
    const payload = this.authService.verifyToken(refreshToken);
    if (!payload) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    
    // Get user from token payload
    const user = await this.usersService.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    
    // Generate new tokens
    const tokens = this.authService.generateToken(user.userid);
    
    // Set refresh token cookie, return access token in response
    this.authService.setRefreshTokenCookie(response, tokens.refreshToken);
    
    return {
      accessToken: tokens.accessToken,
      user: {
        id: user.userid,
        email: user.email,
        avatarUrl: user.avatar,
      }
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Request() req) {
    const user = await this.usersService.findOne(req.user.sub);
    if (!user) {
      return { authenticated: false };
    }
    
    return {
      authenticated: true,
      userid: user.userid,
      email: user.email,
      avatarUrl: user.avatar,
      fullname:user.fullname,
      role:user.role
    };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    this.authService.clearTokenCookie(response);
    return { success: true };
  }
}
