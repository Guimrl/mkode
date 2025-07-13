import { IsEmail, IsNotEmpty, Matches, MaxLength, MinLength } from 'class-validator'

export class SignUpDTO {
  @IsNotEmpty({ message: 'auth.name_required' })
  @MaxLength(50, { message: 'auth.name_too_long' })
  name: string

  @IsEmail({}, { message: 'auth.invalid_email' })
  email: string

  @IsNotEmpty({ message: 'auth.password_required' })
  @MinLength(8, { message: 'auth.password_too_short' })
  @Matches(/[A-Z]/, { message: 'auth.password_uppercase' })
  @Matches(/[a-z]/, { message: 'auth.password_lowercase' })
  @Matches(/[0-9]/, { message: 'auth.password_digit' })
  @Matches(/[@$!%*?&]/, { message: 'auth.password_special' })
  password: string
}

export class SignInDTO {
  @IsEmail({}, { message: 'auth.invalid_email' })
  email: string

  @IsNotEmpty({ message: 'auth.password_required' })
  password: string
}

export class ChangePasswordDTO {
  @IsEmail({}, { message: 'auth.invalid_email' })
  email: string

  @IsNotEmpty({ message: 'auth.password_required' })
  password: string

  @IsNotEmpty({ message: 'auth.new_password_required' })
  newPassword: string
}
