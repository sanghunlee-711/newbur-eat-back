//entity는 database의 모델을 생각하면 된다.

import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class Restaurant {
  //graphql관점에서 restaurant가 어떻게 생겼는지 묘샤하기 용도
  @Field(() => String)
  name: string;
  //Nullabe 셋팅을 통해 ?로 가능
  @Field(() => Boolean, { nullable: true })
  isGood?: boolean;
}
