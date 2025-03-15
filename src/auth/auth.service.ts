import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ accessToken: string }> {
    try {
      const user = await this.usersService.createUser(registerDto); // Reuse createUser from UsersService
      return this.generateJwtToken(user);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error; // Re-throw BadRequestException from UsersService
      }
      throw new BadRequestException('Registration failed'); // Generic registration failure
    }
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string }> {
    const { username, password } = loginDto;
    const user = await this.usersService.findUserByUsername(username);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateJwtToken(user);
  }

  async generateJwtToken(user: User): Promise<{ accessToken: string }> {
    const payload = { sub: user.id, username: user.username }; // Standard 'sub' for user ID
    return {
      accessToken: await this.jwtService.signAsync(payload),
    };
  }
}
