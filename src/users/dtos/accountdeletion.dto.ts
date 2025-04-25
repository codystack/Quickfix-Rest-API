import { IsNotEmpty, IsString } from 'class-validator';

export class AccountDeletionDTO {
  @IsNotEmpty()
  @IsString()
  reason: string;
}
