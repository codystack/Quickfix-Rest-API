import { Inject } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { User, UserDocument } from 'src/schemas/user.schema';
// import { User } from 'src/typeorm/entities/user';
import { UserService } from 'src/users/users.services';

export class SessionSerializer extends PassportSerializer {
  constructor(
    @Inject('AUTH_SERVICE') private readonly userService: UserService,
  ) {
    super();
  }

  // serializeUser(user: User, done: (err: any, user: { _id: string }) => void) {
  //   done(null, { _id: user._id });
  // }
  serializeUser(user: UserDocument, done: (err: any, id: string) => void) {
    done(null, user._id.toString()); // Use user._id (convert to string)
  }

  async deserializeUser(
    user: UserDocument,
    done: (err: any, user: User) => void,
  ) {
    const userDB = await this.userService.findUserById(user?._id);
    console.log('USER DESRIALIZED :: ', userDB);

    return userDB ? done(null, userDB) : done(null, null);
  }
}
