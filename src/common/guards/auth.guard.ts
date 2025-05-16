import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    console.log(token, '--------------------------auth guard');

    if (!token) {
      throw new UnauthorizedException();
    }
    console.log(1111);
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: 'secret',
      });
      console.log(payload, '============payload');
      request['user'] = payload;
    } catch (err) {
      console.log('err------------->>>', err.message);
      throw new BadRequestException('OTP Expired!');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
