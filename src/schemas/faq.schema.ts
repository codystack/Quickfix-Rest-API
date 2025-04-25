import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FAQDocument = HydratedDocument<FAQ>;

@Schema({ timestamps: true })
export class FAQ {
  @Prop()
  question: string;

  @Prop()
  answer: string;
}

export const FAQSchema = SchemaFactory.createForClass(FAQ);
