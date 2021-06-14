//entity는 database의 모델을 생각하면 된다.

import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
@ObjectType() //@ObjectType은 graphql이 자동으로 스키마를 빌드하기 위해 사용하는 Graphql decorator이다.
@Entity() //@Entitysms TypeOrm이 db에 정의한 schema를 저장하게 해주기위해 사용하는 데코레이터이다.
export class Restaurant {
  //graphql관점에서 restaurant가 어떻게 생겼는지 묘샤하기 용도
  @PrimaryGeneratedColumn()
  @Field(() => Number)
  id: number;

  @Field(() => String)
  @Column()
  name: string;
  //Nullabe 셋팅을 통해 ?연산자로 활용 가능
  @Field(() => Boolean)
  @Column()
  isVegan: boolean;

  @Field(() => String)
  @Column()
  address: string;

  @Field(() => String)
  @Column()
  ownerName: string;

  @Field(() => String)
  @Column()
  categoryName: string;
}
