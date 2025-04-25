import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BannerDocument = HydratedDocument<Banner>;

@Schema({ timestamps: true })
export class Banner {
  @Prop()
  title?: string;

  @Prop()
  url: string;

  @Prop()
  preview: string;

  @Prop()
  amount?: number;

  @Prop({
    enum: ['active', 'inactive'],
    default: 'inactive',
  })
  status: string;

  @Prop({
    enum: ['image', 'video'],
    default: 'image',
  })
  type: string;
}

export const BannerSchema = SchemaFactory.createForClass(Banner);
