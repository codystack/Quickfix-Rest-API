import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from './user.schema';
import { Service } from './service.schema';
import { Transaction } from './transactions.schema';
import { Location } from './location.schema';
import { Express } from './express.schema';

export type OrderItem = {
  name: string;
  price: number;
  quantity: number;
};

export enum DeliveryType {
  PICKUP = 'pickup',
  DELIVERY = 'delivery',
  PICKUP_DELIVERY = 'pickup_delivery',
  SHOP_PICKUP = 'shop_pickup',
}

export type OrdersDocument = HydratedDocument<Orders>;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true, // Include virtual fields
    versionKey: false, // Disable __v field
    transform(doc, ret) {
      ret.id = ret._id; // You can optionally add the id field
    },
  },
  toObject: {
    virtuals: true, // Include virtual fields
    versionKey: false, // Disable __v field
    transform(doc, ret) {
      ret.id = ret._id; // You can optionally add the id field
    },
  },
})
export class Orders {
  @Prop()
  order_id: string;

  @Prop()
  description?: string;

  @Prop({
    required: true,
  })
  items?: OrderItem[];

  @Prop({
    required: true,
  })
  amount: number;

  @Prop()
  delivery_fee?: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Service' })
  service: Service;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' })
  transaction: Transaction;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Location' })
  location: Location;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Location' })
  express?: Express;

  @Prop()
  pickup_date?: string;

  @Prop()
  address?: string;

  @Prop()
  landmark?: string;

  @Prop({ enum: DeliveryType })
  deliver_type: DeliveryType;

  @Prop({
    enum: [
      'washed',
      'ironed',
      'packaged',
      'delivered',
      'pending',
      'declined',
      'damaged',
      'completed',
    ],
    default: 'pending',
  })
  status: string;
}

export const OrdersSchema = SchemaFactory.createForClass(Orders);
