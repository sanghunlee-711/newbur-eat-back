import { DynamicModule, Module } from '@nestjs/common';
import { JwtService } from './jwt.service';

@Module({})
export class JwtModule {
  static forRoot(): DynamicModule {
    return {
      module: JwtModule,
      exports: [JwtService],
      providers: [JwtService],
    };
  }
}
