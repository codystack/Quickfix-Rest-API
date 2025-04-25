import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ServiceDocument = HydratedDocument<Service>;

export type ServiceItem = {
  name: string;
  price: number;
};

@Schema({ timestamps: true })
export class Service {
  @Prop()
  title: string;

  @Prop({ enum: ['laundry', 'cleaning', 'car_wash'] })
  category: string;

  @Prop()
  icon_url: string;

  @Prop()
  description: string;

  @Prop()
  items: ServiceItem[];
}

export const ServiceSchema = SchemaFactory.createForClass(Service);
