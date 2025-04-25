import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Activities } from 'src/schemas/activities.schema';
import { Admin } from 'src/schemas/admin.schema';
import { Service } from 'src/schemas/service.schema';
import { AddServiceDTO } from './dtos/addservice.dto';
// import { User } from 'src/schemas/user.schema';

@Injectable()
export class ServicesService {
  constructor(
    @InjectModel(Admin.name)
    private adminRepository: Model<Admin>,
    @InjectModel(Service.name) private serviceRepository: Model<Service>,
    @InjectModel(Activities.name)
    private activitiesRepository: Model<Activities>,
  ) {}

  async addService(payload: AddServiceDTO, email_address: string) {
    //First check if user exist and marketplace exists
    const adm = await this.adminRepository.findOne({
      email_address: email_address,
    });
    if (!adm) {
      throw new HttpException('No admin found.', HttpStatus.NOT_FOUND);
    }

    if (
      adm.type !== 'superadmin' &&
      adm.role !== 'manager' &&
      adm.role !== 'developer' &&
      adm.access !== 'read/write'
    ) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'You do not hava necessary privileges for this action',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const newService = await new this.serviceRepository({
      category: payload.category,
      description: payload.description,
      icon_url: payload.icon_url,
      items: payload.items,
      title: payload.title,
      created_at: new Date(),
      updated_at: new Date(),
    }).save();

    await new this.activitiesRepository({
      category: 'service',
      title: `${adm.first_name} added a new service category`,
      admin: newService?.id ?? newService?._id,
    }).save();
  }

  async allService() {
    return await this.serviceRepository.find({});
  }

  findServiceById(id: any): Promise<Service> {
    return this.serviceRepository.findById(id).lean().exec();
  }

  async findServiceByCategory(category: string): Promise<any> {
    return await this.serviceRepository
      .find({ category: category })
      .lean()
      .exec();
  }

  async updateService(email_address: string, payload: any, serviceId: string) {
    // console.log('PAYLOAD PROFILE UPDATE ::: ', payload);

    if (!payload) {
      throw new HttpException('Payload not provided!', HttpStatus.BAD_REQUEST);
    }

    const admin = await this.adminRepository.findOne({
      email_address: email_address,
    });

    if (!admin)
      throw new HttpException('No admin record found.', HttpStatus.NOT_FOUND);

    if (
      admin.type !== 'superadmin' &&
      admin.role !== 'manager' &&
      admin.role !== 'developer' &&
      admin.access !== 'read/write'
    ) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'You do not hava necessary privileges for this action',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.serviceRepository.updateOne({ _id: serviceId }, { ...payload });

    const updatedService = await this.serviceRepository
      .findOne({
        _id: serviceId,
      })
      .lean()
      .exec();

    await new this.activitiesRepository({
      title: `${admin?.first_name} ${admin?.last_name} update service ${updatedService?.title} on ${new Date().toLocaleString('en-GB')}`,
      category: 'service',
      admin: admin?.id ?? admin?._id,
    }).save();

    return {
      message: 'Service updated successfully',
      data: updatedService,
    };
  }

  async deleteService(email_address: string, id: string) {
    try {
      //First check if user exist and marketplace exists
      const adm = await this.adminRepository.findOne({
        email_address: email_address,
      });
      if (!adm) {
        throw new HttpException('No admin found.', HttpStatus.NOT_FOUND);
      }

      if (
        adm.type !== 'superadmin' &&
        adm.role !== 'manager' &&
        adm.access !== 'read/write'
      ) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            message: 'You do not hava necessary privileges for this action',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const foundService = await this.serviceRepository
        .findOne({
          _id: id,
        })
        .lean()
        .exec();
      if (!foundService) {
        throw new HttpException('Service not found.', HttpStatus.NOT_FOUND);
      }

      await new this.activitiesRepository({
        category: 'service',
        title: `${adm?.first_name} ${adm?.last_name} deleted the service (${foundService?.title}) on ${Date.now().toLocaleString('en-US')}`,
        admin: adm?._id ?? adm?.id,
      }).save();

      await this.serviceRepository
        .deleteOne({ _id: foundService?._id })
        .lean()
        .exec();

      return {
        message: 'Service deleted successfully',
        data: null,
      };
    } catch (error) {
      console.log(error);
    }
  }
}
