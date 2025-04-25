import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from 'src/schemas/notification.schema';
import { CreateNotificationDTO } from './dto/createnotification.dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private notificationRepository: Model<Notification>,
  ) {}

  async findNotifications() {
    return this.notificationRepository.find({});
  }

  async createNotification(
    createNotificationDTO: CreateNotificationDTO,
    userId: string,
  ): Promise<Notification> {
    const newUser = new this.notificationRepository({
      category: createNotificationDTO.category,
      title: createNotificationDTO.title,
      user: userId,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return newUser.save();
  }

  async findNotificationByUser(userId: string): Promise<Notification> {
    const foundNotification = await this.notificationRepository
      .findOne({
        user: userId,
      })
      .lean()
      .exec();

    return foundNotification;
  }
}
