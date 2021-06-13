import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantsModule } from './restaurants/restaurants.module';

@Module({
  //forRoot는 모듈의 루트를 잡아주기 위해서 import하는것
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, //어디서든 .env에 접근가능
      envFilePath: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env.test',
      ignoreEnvFile: process.env.NODE_ENV === 'prod', //배포용일때는 .env파일을 사용하지 않기 위한 옵션
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
      synchronize: true, //typeorm이d db를 연결할때 현재상태로 migration한다는 뜻임
      logging: true, //무슨 일이 일어나는지 console에 나타냄
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
