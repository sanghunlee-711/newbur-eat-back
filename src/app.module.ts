import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { Restaurant } from './restaurants/entities/restaurant.entity';
import { RestaurantsModule } from './restaurants/restaurants.module';

@Module({
  //forRoot는 모듈의 루트를 잡아주기 위해서 import하는것
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, //어디서든 .env에 접근가능
      envFilePath: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env.test',
      ignoreEnvFile: process.env.NODE_ENV === 'prod', //배포용일때는 .env파일을 사용하지 않기 위한 옵션
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('dev', 'prod').required(), //환경변수(process.env)의 유효성 검사를 위해 Joi 모듈을 통해 검사
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRoot({
      //보통 이런 중요한건 .env에 넣는데 nodejs에서는 dotenv모듈을 사용했었음
      //nestjs에서는 다른방식도 가능 공식문서의 configuration부분 참고

      //https://github.com/typeorm/typeorm 여기에 config 옵션들 있다.
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD, //postgres는 기본적으로 localhost로 호출하면 pw를 묻지 않는다
      database: process.env.DB_NAME,
      synchronize: process.env.NODE_ENV !== 'prod', //typeorm이d db를 연결할때 현재상태로 migration한다는 뜻임
      //production에서는 실제 데이터를 가지고 있으므로 위와같이 조건으로 처리
      logging: true, //무슨 일이 일어나는지 console에 나타냄
      entities: [Restaurant],
    }),
    GraphQLModule.forRoot({
      // autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      //true로 설정하면 메모리에 가지고 있고 파일로 안가지고 있음 query파일을
      autoSchemaFile: true,
    }),
    RestaurantsModule,
    //code first , schema first중 code first로 사용
    //https://docs.nestjs.com/graphql/quick-start#code-first
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
