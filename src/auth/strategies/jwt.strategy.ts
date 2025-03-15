import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service'; // Adjust path if needed
import { JwtPayload } from '../interfaces/jwt-payload.interface'; // Create this interface

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key', // Use environment variable!
    });
  }

  async validate(payload: JwtPayload): Promise<any> {
    // Or `Promise<User>` if you want to return full User object
    const user = await this.usersService.findUserById(payload.sub); // 'sub' is standard for user ID in JWT
    if (!user) {
      throw new UnauthorizedException(); // User not found or invalid token
    }
    return { userId: payload.sub, username: payload.username }; // Or return the full User object if needed
  }
}
