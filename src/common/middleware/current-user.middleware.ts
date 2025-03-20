import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';
import { User } from 'src/users/users.entity';
import { UsersService } from 'src/users/users.service';


declare global {
  namespace Express {
    interface Request {
      currentUser?: User;
    }
  }
}

@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
  constructor(private usersService: UsersService, private jwtService: JwtService) {}

  async use(req: Request, res: Response, next: NextFunction) {

      try{
        const token = this.extractTokenFromHeader(req);
        
      if (!token) {
        throw new UnauthorizedException('Unauthorized!');
      }
      const payload = await this.jwtService.verifyAsync(
        token,
        {
          secret: 'secret'
        }
      );
    if (payload?.email) {
      const user = await this.usersService.findOne(payload?.email);
      req.currentUser = user;
  
    }

    next();

      }catch(err){
        console.log(err)
        throw new UnauthorizedException('OTP expired!');
      }
  }


  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
