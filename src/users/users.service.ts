import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto'; // Import UpdateUserDto
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

  async findUserById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return user;
  }

  async findUserByUsername(username: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({ where: { username } });
    if (user === null) {
      return undefined;
    }
    return user;
  }

  async findAllUsers(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async updateUser(id: number, updateUserData: UpdateUserDto): Promise<User> {
    const user = await this.findUserById(id); // Ensure user exists

    if (updateUserData.password) {
      const saltRounds = 10;
      updateUserData.passwordHash = await bcrypt.hash(
        updateUserData.password,
        saltRounds,
      );
      // No need to delete updateUserData.password anymore
    }

    this.usersRepository.merge(user, updateUserData);
    return this.usersRepository.save(user);
  }

  async deleteUser(id: number): Promise<void> {
    const user = await this.findUserById(id); // Ensure user exists
    await this.usersRepository.remove(user);
  }
}
