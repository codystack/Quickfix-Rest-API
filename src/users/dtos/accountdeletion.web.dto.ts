import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AccountDeletionWebDTO {
  @IsNotEmpty()
  @IsString()
  fullname: string;

  @IsNotEmpty()
  @IsEmail()
  emailAddress: string;
}
