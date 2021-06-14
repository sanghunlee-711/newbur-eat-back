//entity는 database의 모델을 생각하면 된다.

import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsString, Length } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
@InputType({ isAbstract: true }) //스키마는 하나의 type을 가져야하는데 이렇게 isAbstract옵션을 이용함으로서 다른 곳에서 InputType으로서 사용할 수 있음.
//InputType으로 쓴다는게 아니라 InputType으로도 extend시킨다는 뜻으로 이해하자!
@ObjectType() //@ObjectType은 graphql이 자동으로 스키마를 빌드하기 위해 사용하는 Graphql decorator이다.
@Entity() //@Entitysms TypeOrm이 db에 정의한 schema를 저장하게 해주기위해 사용하는 데코레이터이다.
export class Restaurant {
  //graphql관점에서 restaurant가 어떻게 생겼는지 묘샤하기 용도
  @PrimaryGeneratedColumn()
  @Field(() => Number)
  id: number;

  @Field(() => String)
  @Column()
  @IsString()
  name: string;
  //Nullabe 셋팅을 통해 ?연산자로 활용 가능
  @Field(() => Boolean)
  @Column()
  @IsBoolean()
  isVegan: boolean;

  @Field(() => String)
  @Column()
  @IsString()
  address: string;

  @Field(() => String)
  @Column()
  @IsString()
  @Length(5)
  ownerName: string;

  @Field(() => String)
  @Column()
  @IsString()
  categoryName: string;
}
