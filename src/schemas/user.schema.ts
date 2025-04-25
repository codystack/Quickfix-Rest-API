import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type Wallet = {
  balance: number;
  prev_balance: number;
  last_updated: Date;
};

export type UserDocument = HydratedDocument<User> & { _id: Types.ObjectId }; // HydratedDocument<User>;

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
export class User {
  @Prop()
  first_name: string;

  @Prop()
  last_name: string;

  @Prop()
  photoUrl: string;

  @Prop({ required: true, unique: true })
  email_address: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: false })
  is_email_verified: boolean;

  @Prop({ unique: false, required: true })
  international_phone_format: string;

  @Prop({ required: true, default: '+234' })
  dial_code: string;

  @Prop({ unique: true, required: true })
  phone_number: string;

  @Prop({ unique: true, required: true })
  referral_code: string;

  @Prop()
  dob: Date;

  @Prop({ enum: ['male', 'female'] })
  gender: string;

  @Prop({ enum: ['active', 'suspended', 'deleted'], default: 'active' })
  status: string;

  @Prop()
  address: string;

  @Prop({
    type: {
      balance: Number,
      prev_balance: Number,
      last_updated: Date,
    },
    default: { balance: 0, prev_balance: 0, last_updated: new Date() },
  })
  wallet: Wallet;

  @Prop({ default: false })
  is_profile_set: boolean;

  @Prop()
  next_login: Date;

  @Prop()
  last_login: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
