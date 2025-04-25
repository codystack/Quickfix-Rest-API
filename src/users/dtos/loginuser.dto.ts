import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginUserDTO {
  @IsEmail({}, { message: 'Provide a valid email address' })
  @IsNotEmpty({ message: 'Email address is required' })
  email_address: string;

  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
