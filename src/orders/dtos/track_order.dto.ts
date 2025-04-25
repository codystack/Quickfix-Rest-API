import { IsNotEmpty, IsString } from 'class-validator';

export class TrackOrderDTO {
  @IsNotEmpty()
  @IsString()
  order_id: string;
}
