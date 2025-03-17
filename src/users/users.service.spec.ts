import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    merge: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));

    // Clear all mocks between tests
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    const createUserDto: CreateUserDto = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    };

    const mockUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      passwordHash: 'hashedpassword',
    };

    it('should successfully create a user', async () => {
      mockRepository.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
      mockRepository.create.mockReturnValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');

      const result = await service.createUser(createUserDto);

      expect(mockRepository.findOne).toHaveBeenCalledTimes(2);
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockRepository.create).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hashedpassword',
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });

    it('should throw BadRequestException if username already exists', async () => {
      mockRepository.findOne.mockResolvedValueOnce(mockUser);

      await expect(service.createUser(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { username: 'testuser' },
      });
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if email already exists', async () => {
      mockRepository.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(mockUser);

      await expect(service.createUser(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockRepository.findOne).toHaveBeenCalledTimes(2);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findUserById', () => {
    it('should return a user when found by id', async () => {
      const mockUser = { id: 1, username: 'testuser' };
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findUserById(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found by id', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findUserById(999)).rejects.toThrow(NotFoundException);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 999 } });
    });
  });

  describe('findUserByUsername', () => {
    it('should return a user when found by username', async () => {
      const mockUser = { id: 1, username: 'testuser' };
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findUserByUsername('testuser');

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { username: 'testuser' } });
      expect(result).toEqual(mockUser);
    });

    it('should return undefined when user not found by username', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findUserByUsername('nonexistent');

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { username: 'nonexistent' } });
      expect(result).toBeUndefined();
    });
  });

  describe('findAllUsers', () => {
    it('should return an array of users', async () => {
      const mockUsers = [
        { id: 1, username: 'user1' },
        { id: 2, username: 'user2' }
      ];
      mockRepository.find.mockResolvedValue(mockUsers);

      const result = await service.findAllUsers();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });
  });

  describe('updateUser', () => {
    const updateUserDto: UpdateUserDto = {
      email: 'updated@example.com',
    };

    const mockUser = {
      id: 1,
      username: 'testuser',
      email: 'original@example.com',
    };

    it('should update a user without password change', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.merge.mockReturnValue({
        ...mockUser,
        email: updateUserDto.email,
      });
      mockRepository.save.mockResolvedValue({
        ...mockUser,
        email: updateUserDto.email,
      });

      const result = await service.updateUser(1, updateUserDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockRepository.merge).toHaveBeenCalledWith(mockUser, updateUserDto);
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result.email).toBe('updated@example.com');
    });

    it('should update a user with password change', async () => {
      const updateWithPasswordDto: UpdateUserDto = {
        ...updateUserDto,
        password: 'newpassword123',
      };

      mockRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newhashpassword');
      mockRepository.merge.mockReturnValue({
        ...mockUser,
        email: updateUserDto.email,
        passwordHash: 'newhashpassword',
      });
      mockRepository.save.mockResolvedValue({
        ...mockUser,
        email: updateUserDto.email,
        passwordHash: 'newhashpassword',
      });

      const result = await service.updateUser(1, updateWithPasswordDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword123', 10);
      expect(mockRepository.merge).toHaveBeenCalledWith(mockUser, {
        ...updateWithPasswordDto,
        passwordHash: 'newhashpassword',
      });
      expect(result.passwordHash).toBe('newhashpassword');
    });

    it('should throw NotFoundException when updating non-existent user', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.updateUser(999, updateUserDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete a user successfully', async () => {
      const mockUser = { id: 1, username: 'testuser' };
      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.remove.mockResolvedValue(undefined);

      await service.deleteUser(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockRepository.remove).toHaveBeenCalledWith(mockUser);
    });

    it('should throw NotFoundException when deleting non-existent user', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteUser(999)).rejects.toThrow(NotFoundException);
      expect(mockRepository.remove).not.toHaveBeenCalled();
    });
  });
});