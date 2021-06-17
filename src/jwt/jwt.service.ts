import { Inject, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { CONFIG_OPTIONS } from './jwt.constants';
import { jwtModuleOptions } from './jwt.interfaces';

@Injectable()
export class JwtService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: jwtModuleOptions,
  ) {
    console.log('@@@', options);
  }

  sign(userId: number): string {
    console.log('HELLO');
    return jwt.sign({ id: userId }, this.options.privateKey);
  }
}
