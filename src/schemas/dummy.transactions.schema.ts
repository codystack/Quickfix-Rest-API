import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from './user.schema';
import { TransactionType } from 'src/enums/transaction.enum';

export type DummyTransactionDocument = HydratedDocument<DummyTransaction>;

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
export class DummyTransaction {
  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, unique: true })
  trans_ref: string;

  @Prop({ required: true })
  status: string;

  @Prop()
  description: string;

  @Prop({ enum: TransactionType, required: true })
  type: TransactionType;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;
}

export const DummyTransactionSchema =
  SchemaFactory.createForClass(DummyTransaction);
