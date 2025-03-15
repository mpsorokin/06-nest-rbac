import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // Import TypeOrmModule and register the User entity
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Export UsersService if you need to use it in other modules (like AuthService later)
})
export class UsersModule {}
