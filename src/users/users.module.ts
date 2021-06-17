import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

@Module({
  //ConfigService를 불러온 module로 불러와 import를 시켜 service에서 사용하는 이유는
  //env키를 사용할때 process.env를 하는 방식이 아닌 nest답게 쓰기 위해 configService모듈을 들고와서
  //service에서 this.config.get("SECRET_KEY")로 사용해주기 위해서이다.
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersResolver, UsersService],
})
export class UsersModule {}
