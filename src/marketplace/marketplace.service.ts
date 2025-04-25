import { Injectable } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin } from 'src/schemas/admin.schema';
import { Activities } from 'src/schemas/activities.schema';
// import { Repository } from 'typeorm';

@Injectable()
export class MarketplaceService {
  constructor(
    @InjectModel(Admin.name) private adminRepository: Model<Admin>,
    @InjectModel(Activities.name)
    private activitiesRepository: Model<Activities>,
  ) {}
}
