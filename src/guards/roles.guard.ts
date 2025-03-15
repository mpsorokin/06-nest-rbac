import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../entities/user.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      'roles',
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true; // No roles required, allow access
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // User object added by JwtStrategy

    if (!user || !user.userId) {
      return false; // No authenticated user
    }

    const fullUser = await this.usersService.findUserById(user.userId); // Fetch full user object with role
    if (!fullUser) {
      return false; // User not found
    }

    return requiredRoles.some((role) => fullUser.role === role); // Check if user role is among allowed roles
  }
}
