import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SocialDocument = HydratedDocument<Social>;

@Schema({ timestamps: true })
export class Social {
  @Prop()
  name: string;

  @Prop()
  logo: string;

  @Prop()
  url: string;
}

export const SocialSchema = SchemaFactory.createForClass(Social);
