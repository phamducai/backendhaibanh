import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.users.findMany();
  }

  async findOne(id: string) {
    return this.prisma.users.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.users.findUnique({
      where: { email },
    });
  }

  async findByGoogleId(googleId: string) {
    return this.prisma.users.findUnique({
      where: { google_id: googleId },
    });
  }

  async findOrCreateByGoogle(userData: CreateUserDto) {
    // Check if user exists by Google ID
    let user: any = undefined;
    
    // Only look up by Google ID if it's provided
    if (userData.googleId) {
      user = await this.findByGoogleId(userData.googleId);
    }
    
    // If not found by Google ID, try by email
    if (!user) {
      user = await this.findByEmail(userData.email);
    }

    // If found, update last login and Google ID if needed
    if (user) {
      return this.prisma.users.update({
        where: { id: user.id },
        data: { 
          last_login: new Date(),
          // Update Google ID if it wasn't set and is provided now
          ...(userData.googleId && !user.google_id ? { google_id: userData.googleId } : {}),
          // Update avatar if provided
          ...(userData.avatarUrl ? { avatar_url: userData.avatarUrl } : {})
        }
      });
    }

    // If user doesn't exist, create new one
    return this.prisma.users.create({
      data: {
        full_name: userData.fullName,
        email: userData.email,
        google_id: userData.googleId,
        avatar_url: userData.avatarUrl,
        last_login: new Date(),
      }
    });
  }

  async register(registerDto: RegisterUserDto) {
    // Kiểm tra email đã tồn tại chưa
    const existingUser = await this.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Mã hóa mật khẩu
    const hashedPassword = await argon2.hash(registerDto.password);

    // Tạo người dùng mới
    return this.prisma.users.create({
      data: {
        full_name: registerDto.fullName,
        email: registerDto.email,
        pass_word: hashedPassword, 
        avatar_url: registerDto.avatarUrl,
        last_login: new Date(),
      }
    });
  }

  async validateUser(loginDto: LoginUserDto) {
    // Tìm user theo email
    const user = await this.findByEmail(loginDto.email);
    if (!user || !user.pass_word) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Kiểm tra mật khẩu
    const isPasswordValid = await argon2.verify(user.pass_word, loginDto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Cập nhật thời gian đăng nhập
    await this.prisma.users.update({
      where: { id: user.id },
      data: { last_login: new Date() }
    });

    return user;
  }
}
