import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type LocationDocument = HydratedDocument<Location>;

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
export class Location {
  @Prop()
  region: string;

  @Prop()
  city: string;

  @Prop({ enum: ['active', 'deleted'], default: 'active' })
  status: string;
}

export const LocationSchema = SchemaFactory.createForClass(Location);
