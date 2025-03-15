import { IsNotEmpty, IsEmail, MinLength, ValidateIf } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  readonly username!: string;

  @IsNotEmpty()
  @IsEmail()
  readonly email!: string;

  @IsNotEmpty()
  @MinLength(6)
  readonly password!: string;

  @ValidateIf((o) => o.password !== null && o.password !== undefined) // Only validate if password is provided
  @IsNotEmpty()
  readonly passwordConfirmation!: string;
}
