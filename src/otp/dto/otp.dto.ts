import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class OTPPayloadDTO {
  @IsNotEmpty()
  @IsEmail()
  email_address: string;

  @IsNotEmpty()
  @IsString()
  code: string;
}
