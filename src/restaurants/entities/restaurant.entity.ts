//entity는 database의 모델을 생각하면 된다.

import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Restaurant {
  //graphql관점에서 restaurant가 어떻게 생겼는지 묘샤하기 용도
  @Field(() => String)
  name: string;
  //Nullabe 셋팅을 통해 ?연산자로 활용 가능
  @Field(() => Boolean)
  isVegan: boolean;

  @Field(() => String)
  address: string;

  @Field(() => String)
  ownerName: string;
}
