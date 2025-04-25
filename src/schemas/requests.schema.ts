import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from './user.schema';

export type RequestsDocument = HydratedDocument<Requests>;

@Schema({ timestamps: true })
export class Requests {
  @Prop()
  reason: string;

  @Prop()
  description?: string;

  @Prop({
    enum: ['account_deletion', 'customer_support', 'enquiry'],
    default: 'enquiry',
  })
  requests_type?: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;

  @Prop({
    enum: ['pending', 'completed', 'rejected', 'canceled'],
    default: 'pending',
  })
  status: string;
}

export const RequestsSchema = SchemaFactory.createForClass(Requests);
