import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UserService } from './users.services';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';

import {
  Notification,
  NotificationSchema,
} from 'src/schemas/notification.schema';
import { Activities, ActivitiesSchema } from 'src/schemas/activities.schema';
import { Admin, AdminSchema } from 'src/schemas/admin.schema';
import { Requests, RequestsSchema } from 'src/schemas/requests.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: Activities.name, schema: ActivitiesSchema },
      { name: Admin.name, schema: AdminSchema },
      { name: Requests.name, schema: RequestsSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [
    // {
    //   provide: 'HISTORY_SERVICE',
    //   useClass: HistoryService,
    // },
    UserService,
  ],
})
export class UsersModule {}

// export class UsersModule implements NestModule {
//   configure(consumer: MiddlewareConsumer) {
//     consumer.apply(UsersMiddleware).forRoutes('users');
//   }
// }
