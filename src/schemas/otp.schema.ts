import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OTPDocument = HydratedDocument<OTP>;

@Schema({ timestamps: true })
export class OTP {
  @Prop()
  email_address: string;

  @Prop()
  code: string;

  @Prop()
  expiresAt: Date;
}

export const OTPSchema = SchemaFactory.createForClass(OTP);
