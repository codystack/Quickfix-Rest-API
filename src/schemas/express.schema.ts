import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ExpressDocument = HydratedDocument<Express>;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true, // Include virtual fields
    versionKey: false, // Disable __v field
    transform(doc, ret) {
      ret.id = ret._id; // You can optionally add the id field
      delete ret._id; // Remove the _id field if needed
    },
  },
  toObject: {
    virtuals: true, // Include virtual fields
    versionKey: false, // Disable __v field
    transform(doc, ret) {
      ret.id = ret._id; // You can optionally add the id field
      delete ret._id; // Remove the _id field if needed
    },
  },
})
export class Express {
  @Prop()
  name: string;

  @Prop()
  fee: number;
}

export const ExpressSchema = SchemaFactory.createForClass(Express);
