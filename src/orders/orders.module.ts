import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';
import {
  Notification,
  NotificationSchema,
} from 'src/schemas/notification.schema';
import { Orders, OrdersSchema } from 'src/schemas/orders.schema';
import { Service, ServiceSchema } from 'src/schemas/service.schema';
import { Express, ExpressSchema } from 'src/schemas/express.schema';
import { Admin, AdminSchema } from 'src/schemas/admin.schema';
import { Activities, ActivitiesSchema } from 'src/schemas/activities.schema';
import {
  AdminWallet,
  AdminWalletSchema,
} from 'src/schemas/admin.wallet.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Admin.name, schema: AdminSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: Orders.name, schema: OrdersSchema },
      { name: Service.name, schema: ServiceSchema },
      { name: Express.name, schema: ExpressSchema },
      { name: Activities.name, schema: ActivitiesSchema },
      { name: AdminWallet.name, schema: AdminWalletSchema },
    ]),
  ],
  providers: [OrdersService],
  controllers: [OrdersController],
})
export class OrdersModule {}
