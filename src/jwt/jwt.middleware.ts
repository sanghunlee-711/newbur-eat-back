import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { UsersService } from 'src/users/users.service';
import { JwtService } from './jwt.service';

@Injectable() //injectable마킹을 안하면 Dependency injection 하기가 힘듬
export class JwtMiddleware implements NestMiddleware {
  //@Injectable을 해줌으로서 jwtService 인젝션 가능
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    if ('x-jwt' in req.headers) {
      const token = req.headers['x-jwt'];
      //ts는 header의 어떤 요소도 array가 될 수 있다고 셋팅되어 있기때문에 .toString()으로 처리
      try {
        const decoded = this.jwtService.verify(token.toString());

        if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
          //리팩토링 후 findByID 메서드에서 유저 객체 전체를 반환하기때문에 구조 분해할당으로 변경
          const { user, ok } = await this.userService.findByID(decoded['id']);
          if (ok) {
            //put user in req
            req['user'] = user;
          }
        }
      } catch (error) {}
    }

    next();
  }
}
