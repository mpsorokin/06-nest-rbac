import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { username, email, password } = createUserDto;

    // Check if username or email already exists
    const existingUserByUsername = await this.usersRepository.findOne({
      where: { username },
    });
    if (existingUserByUsername) {
      throw new BadRequestException('Username already taken');
    }
    const existingUserByEmail = await this.usersRepository.findOne({
      where: { email },
    });
    if (existingUserByEmail) {
      throw new BadRequestException('Email already registered');
    }

    const saltRounds = 10; // Standard salt rounds for bcrypt
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = this.usersRepository.create({
      username,
      email,
      passwordHash, // Store the hashed password
    });

    return this.usersRepository.save(user);
  }

  async findUserById(id: number): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      return undefined; // Or you could throw a NotFoundException here if you prefer
    }
    return user;
  }

  async findUserByUsername(username: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({ where: { username } });
    if (!user) {
      return undefined; // Or you could throw a NotFoundException here if you prefer
    }
    return user;
  }
}
