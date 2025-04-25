import { Module } from '@nestjs/common';
import { MarketplaceController } from './marketplace.controller';
import { MarketplaceService } from './marketplace.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Admin, AdminSchema } from 'src/schemas/admin.schema';
import { Activities, ActivitiesSchema } from 'src/schemas/activities.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Admin.name, schema: AdminSchema },
      { name: Activities.name, schema: ActivitiesSchema },
    ]),
  ],
  providers: [
    // {
    //   provide: 'HISTORY_SERVICE',
    //   useClass: HistoryService,
    // },
    MarketplaceService,
  ],
  controllers: [MarketplaceController],
})
export class MarketplaceModule {}
