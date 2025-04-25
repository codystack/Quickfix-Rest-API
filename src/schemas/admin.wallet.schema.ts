import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AdminWalletDocument = HydratedDocument<AdminWallet>;

@Schema({ timestamps: true })
export class AdminWallet {
  @Prop({ type: 'number', default: 0.0 })
  balance: number;

  @Prop({ type: 'number', default: 0.0 })
  prev_balance: number;
}

export const AdminWalletSchema = SchemaFactory.createForClass(AdminWallet);
