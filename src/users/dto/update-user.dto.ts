import { IsString, IsEmail, MinLength, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  readonly username?: string;

  @IsOptional()
  @IsEmail()
  readonly email?: string;

  @IsOptional()
  @MinLength(6)
  readonly password?: string;

  // passwordHash is not exposed in DTO, it's handled internally in service
  passwordHash?: string; // To temporarily store hashed password before saving
}
