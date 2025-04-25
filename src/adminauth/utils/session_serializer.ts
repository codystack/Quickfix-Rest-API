import { Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PassportSerializer } from '@nestjs/passport';
import { Model } from 'mongoose';
import { AdminsService } from 'src/admins/admins.service';
import { Admin } from 'src/schemas/admin.schema';
import { UserService } from 'src/users/users.services';

export class SessionSerializer extends PassportSerializer {
  constructor(
    @Inject('ADMIN_SERVICE') private readonly adminService: AdminsService,
  ) {
    super();
  }

  serializeUser(user: Admin, done: (err: any, user: Admin) => void) {
    done(null, user);
  }

  async deserializeUser(user: any, done: (err: any, user: any) => void) {
    const userDB = await this.adminService.findAdminById(user?._id ?? user?.id);
    return userDB ? done(null, userDB) : done(null, null);
  }
}