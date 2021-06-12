import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantsModule } from './restaurants/restaurants.module';

@Module({
  //forRoot는 모듈의 루트를 잡아주기 위해서 import하는것
  imports: [
    TypeOrmModule.forRoot({
      //https://github.com/typeorm/typeorm 여기에 config 옵션들 있다.
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'cloudlee',
      password: '1234', //postgres는 기본적으로 localhost로 호출하면 pw를 묻지 않는다
      database: 'nuber-eats',
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
