import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { AccessRights, AdminRoles } from 'src/admins/dtos/createadmin.dto';

export class CredentialsDTO {
  @IsEmail()
  @IsNotEmpty()
  email_address: string;

  @IsNotEmpty()
  @IsStrongPassword()
  password: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(AdminRoles)
  role: AdminRoles;

  @IsNotEmpty()
  @IsString()
  @IsEnum(AccessRights)
  access: AccessRights;
}
