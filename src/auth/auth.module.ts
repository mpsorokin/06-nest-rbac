import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module'; // Import UsersModule to use UsersService
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Import ConfigModule and ConfigService

@Module({
  imports: [
    UsersModule, // Import UsersModule to use UsersService
    PassportModule,
    JwtModule.registerAsync({
      // Register JwtModule asynchronously using registerAsync
      imports: [ConfigModule], // Import ConfigModule to access ConfigService
      useFactory: async (configService: ConfigService) => ({
        // Use factory function to access ConfigService
        secret: configService.get<string>('JWT_SECRET') || 'your-secret-key', // Get secret from config, default if not found
        signOptions: { expiresIn: '1h' }, // Token expiration time - can also be configured
      }),
      inject: [ConfigService], // Inject ConfigService into the factory function
    }),
    ConfigModule, // Import ConfigModule to be able to use ConfigService in this module
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService], // Optionally export AuthService if you want to use it in other modules
})
export class AuthModule {}
