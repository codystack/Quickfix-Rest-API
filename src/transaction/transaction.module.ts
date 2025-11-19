import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { Transaction, TransactionSchema } from 'src/schemas/transactions.schema';
import { User, UserSchema } from 'src/schemas/user.schema';
import { DummyTransaction, DummyTransactionSchema } from 'src/schemas/dummy.transactions.schema';
import { Notification, NotificationSchema } from 'src/schemas/notification.schema';
import { AdminWallet, AdminWalletSchema } from 'src/schemas/admin.wallet.schema';
import { OrdersModule } from 'src/orders/orders.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
      { name: User.name, schema: UserSchema },
      { name: DummyTransaction.name, schema: DummyTransactionSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: AdminWallet.name, schema: AdminWalletSchema },
    ]),
    OrdersModule,
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
  exports: [TransactionService],
})
export class TransactionModule {}
