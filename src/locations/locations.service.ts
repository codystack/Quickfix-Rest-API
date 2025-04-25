import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin } from 'src/schemas/admin.schema';
import { AddLocation } from './dto/Add.Location.dto';
import { AccessRights, AdminType } from 'src/admins/dtos/createadmin.dto';
import { Activities } from 'src/schemas/activities.schema';
import { Location } from 'src/schemas/location.schema';

@Injectable()
export class LocationService {
  constructor(
    @InjectModel(Location.name)
    private locationRepository: Model<Location>,
    @InjectModel(Admin.name)
    private adminRepository: Model<Admin>,
    @InjectModel(Activities.name)
    private activityRepository: Model<Activities>,
  ) {}

  async saveLocation({ city, region }: AddLocation, email_address: string) {
    try {
      //First check if user exist and marketplace exists
      const admin = await this.adminRepository
        .findOne({
          email_address: email_address,
        })
        .lean()
        .exec();

      if (!admin) {
        throw new HttpException('No admin found.', HttpStatus.NOT_FOUND);
      }

      if (
        admin.access !== AccessRights.READ_WRITE &&
        admin.type !== AdminType.SUPER_ADMIN
      ) {
        throw new HttpException('You are not permitted!', HttpStatus.FORBIDDEN);
      }

      const locat = await this.locationRepository
        .findOne({
          $and: [{ region: region }, { city: city }],
        })
        .lean()
        .exec();

      if (locat) {
        throw new HttpException(
          'Location already added',
          HttpStatus.BAD_REQUEST,
        );
      }

      const newLocation = await new this.locationRepository({
        city: city,
        region: region,
        created_at: new Date(),
        updated_at: new Date(),
      }).save();

      await new this.activityRepository({
        category: 'location',
        title: `${admin?.first_name} ${admin?.last_name} added a new location`,
        admin: admin?._id,
      }).save();

      return {
        message: 'Location added successfully',
        data: newLocation,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async findAllLocations() {
    return this.locationRepository.find({ status: { $ne: 'deleted' } }).exec();
  }

  async allLocations(page: number, limit: number) {
    const skip = (page - 1) * limit; // Calculate the number of records to skip

    const [data, total] = await Promise.all([
      this.locationRepository
        .find({ status: { $ne: 'deleted' } })
        .skip(skip) // Skip the records
        .limit(limit) // Limit the number of records returned
        .exec(),
      this.locationRepository.countDocuments({ status: { $ne: 'deleted' } }), // Count total documents for calculating total pages
    ]);

    return {
      data,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      perPage: limit,
    };
  }

  async updateLocation(email_address: string, id: string, payload: any) {
    if (!payload) {
      throw new HttpException('Payload not provided!', HttpStatus.BAD_REQUEST);
    }

    const admin = await this.adminRepository
      .findOne({
        email_address: email_address,
      })
      .lean()
      .exec();

    if (!admin)
      throw new HttpException('No admin record found.', HttpStatus.NOT_FOUND);

    if (
      admin.access !== AccessRights.READ_WRITE &&
      admin.type !== AdminType.SUPER_ADMIN
    ) {
      throw new HttpException('You are not permitted ', HttpStatus.FORBIDDEN);
    }

    await this.locationRepository.updateOne({ _id: id }, { ...payload });

    const updatedLocation = await this.locationRepository
      .findOne({
        _id: id,
      })
      .lean()
      .exec();

    await new this.activityRepository({
      title: `${admin?.first_name} ${admin?.last_name} updated location on ${new Date().toLocaleString('en-GB')}`,
      category: 'location',
      admin: admin?._id,
    }).save();

    return {
      message: 'Location updated successfully',
      data: updatedLocation,
    };
  }

  async deleteLocation(email_address: string, id: string) {
    const admin = await this.adminRepository
      .findOne({
        email_address: email_address,
      })
      .lean()
      .exec();

    if (!admin)
      throw new HttpException('No admin record found.', HttpStatus.NOT_FOUND);

    if (
      admin.access !== AccessRights.READ_WRITE &&
      admin.type !== AdminType.SUPER_ADMIN
    ) {
      throw new HttpException('You are not permitted ', HttpStatus.FORBIDDEN);
    }

    await this.locationRepository.updateOne({ _id: id }, { status: 'deleted' });

    await this.locationRepository
      .findOne({
        _id: id,
      })
      .lean()
      .exec();

    await new this.activityRepository({
      title: `${admin?.first_name} ${admin?.last_name} deleted a location on ${new Date().toLocaleString('en-GB')}`,
      category: 'location',
      admin: admin?._id,
    }).save();

    return {
      message: 'Location deleted successfully',
      data: null,
    };
  }
}
