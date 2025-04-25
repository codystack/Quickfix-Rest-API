import { IsNotEmpty, IsStrongPassword } from 'class-validator';

export class ChangePasswordDTO {
  @IsNotEmpty()
  @IsStrongPassword()
  current_password: string;

  @IsNotEmpty()
  @IsStrongPassword()
  new_password: string;
}
