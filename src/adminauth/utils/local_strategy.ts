import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AdminAuthService } from '../adminauth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject('ADMIN_AUTH_SERVICE')
    private readonly authService: AdminAuthService,
  ) {
    super({});
  }

  async validate(username: string, password: string) {
    const user = await this.authService.validateAdmin(username, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}