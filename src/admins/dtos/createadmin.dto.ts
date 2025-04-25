import {
  IsAlpha,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export enum AdminRoles {
  MANAGER = 'manager',
  CUSTOMER_SUPPORT = 'support',
  DEVELOPER = 'developer',
  EDITOR = 'editor',
}

export enum AccessRights {
  READ_ONLY = 'readonly',
  READ_WRITE = 'read/write',
}

export enum AdminType {
  SUPER_ADMIN = 'superadmin',
  ADMIN = 'admin',
}

export class CreateAdminDTO {
  @IsNotEmpty({ message: 'First name is required' })
  @IsString()
  @IsAlpha('en-US', { message: 'Only alphabets are allowed' })
  first_name: string;

  @IsNotEmpty({ message: 'Last name is required' })
  @IsString()
  @IsAlpha('en-US', { message: 'Only alphabets are allowed' })
  last_name: string;

  @IsNotEmpty({ message: 'Email address is required' })
  @IsEmail({}, { message: 'Email address is invalid' })
  email_address: string;

  @IsOptional()
  password: string;

  @IsOptional()
  location: string;

  @IsNotEmpty({ message: 'Phone number is required' })
  @IsString({ message: 'Phone number must be a string' })
  phone_number: string;

  @IsNotEmpty({ message: 'Admin role is required' })
  @IsString({ message: 'Admin role must be a string' })
  @IsEnum(AdminRoles)
  role: AdminRoles;

  @IsNotEmpty({ message: 'Admin access right is required' })
  @IsString()
  @IsEnum(AccessRights)
  access: AccessRights;

  @IsNotEmpty({ message: 'Admin type is required' })
  @IsString()
  @IsEnum(AdminType)
  type: AdminType;

  @IsNotEmpty({ message: 'Address is required' })
  @IsString()
  address: string;
}
