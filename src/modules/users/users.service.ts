import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import * as argon2 from 'argon2';
import { AuthenticationDto } from './dto/authentication.dto';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../database/prisma.service';


@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.users.findMany();
  }

  async findOne(id: string) {
    return this.prisma.users.findUnique({
      where: { userid: id },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.users.findUnique({
      where: { email },
    });
  }

  async findByGoogleId(googleId: string) {
    return this.prisma.users.findUnique({
      where: { googleid: googleId },
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
        where: { userid: user.userid },
        data: {
          googleid: userData.googleId,
          avatar: userData.avatarUrl,
        }
      });
    }

    // If user doesn't exist, create new one
    return this.prisma.users.create({
      data: {
        email: userData.email,
        googleid: userData.googleId,
        avatar: userData.avatarUrl,
        isgooglelogin:true,
        userid: uuidv4(),
      }
    });
  }

  async register(registerDto: AuthenticationDto) {
    const existingUser = await this.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Mã hóa mật khẩu
    const hashedPassword = await argon2.hash(registerDto.password);

    // Tạo người dùng mới
    return this.prisma.users.create({
      data: {
        userid: uuidv4(),
        email: registerDto.email,
        password: hashedPassword, 
        fullname:registerDto.fullname
      }
    });
  }

  async validateUser(loginDto: AuthenticationDto) {
    // Tìm user theo email
    const user = await this.findByEmail(loginDto.email);
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Kiểm tra mật khẩu
    const isPasswordValid = await argon2.verify(user.password, loginDto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Cập nhật thời gian đăng nhập
    await this.prisma.users.update({
      where: { userid: user.userid },
      data: { updatedat: new Date() }
    });

    return user;
  }
}
