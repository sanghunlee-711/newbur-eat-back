import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';

@Module({
  //forRoot는 모듈의 루트를 잡아주기 위해서 import하는것
  imports: [
    GraphQLModule.forRoot({
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    }),
    //code first , schema first중 code first로 사용
    //https://docs.nestjs.com/graphql/quick-start#code-first
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
