import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  AccessRights,
  AdminRoles,
  AdminType,
} from 'src/admins/dtos/createadmin.dto';
import { Location } from './location.schema';

export type AdminDocument = HydratedDocument<Admin>;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true, // Include virtual fields
    versionKey: false, // Disable __v field
    transform(doc, ret) {
      ret.id = ret._id; // You can optionally add the id field
      delete ret._id; // Remove the _id field if needed
      delete ret.password; // Remove sensitive data like password
    },
  },
  toObject: {
    virtuals: true, // Include virtual fields
    versionKey: false, // Disable __v field
    transform(doc, ret) {
      ret.id = ret._id; // You can optionally add the id field
      delete ret._id; // Remove the _id field if needed
      delete ret.password; // Remove sensitive data like password
    },
  },
})
export class Admin {
  @Prop()
  first_name: string;

  @Prop()
  last_name: string;

  @Prop()
  photo: string;

  @Prop({ required: true, unique: true })
  email_address: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: false })
  is_email_verified: boolean;

  @Prop({ unique: true, required: true })
  phone_number: string;

  @Prop({ enum: ['male', 'female'], default: 'male' })
  gender: string;

  @Prop({ enum: AdminType, default: AdminType.ADMIN })
  type: AdminType;

  @Prop({ enum: AdminRoles, default: AdminRoles.MANAGER })
  role: AdminRoles;

  @Prop({ enum: AccessRights, default: AccessRights.READ_ONLY })
  access: AccessRights;

  @Prop()
  address: string;

  @Prop({ type: Types.ObjectId, ref: 'Location' })
  location: Types.ObjectId | Location;

  @Prop({ default: false })
  is_profile_set: boolean;

  @Prop()
  next_login: Date;

  @Prop()
  last_login: Date;

  @Prop({ enum: ['active', 'suspended'], default: 'active' })
  status: string;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
