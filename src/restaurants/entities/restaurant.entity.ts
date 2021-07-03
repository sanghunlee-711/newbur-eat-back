//entity는 database의 모델을 생각하면 된다.

import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Category } from './category.entity';
@InputType('RestaurantInputType', { isAbstract: true }) //스키마는 하나의 type을 가져야하는데 이렇게 isAbstract옵션을 이용함으로서 다른 곳에서 InputType으로서 사용할 수 있음.
//InputType으로 쓴다는게 아니라 InputType으로도 extend시킨다는 뜻으로 이해하자!
@ObjectType() //@ObjectType은 graphql이 자동으로 스키마를 빌드하기 위해 사용하는 Graphql decorator이다.
@Entity() //@Entitysms TypeOrm이 db에 정의한 schema를 저장하게 해주기위해 사용하는 데코레이터이다.
export class Restaurant extends CoreEntity {
  @Field(() => String)
  @Column()
  @IsString()
  @Length(5)
  name: string;

  @Field(() => String)
  @Column()
  @IsString()
  coverImg: string;

  @Field(() => String, { defaultValue: '금호' })
  @Column()
  @IsString()
  address: string;

  @Field(() => Category, { nullable: true })
  @ManyToOne(() => Category, (category) => category.restaurants, {
    nullable: true,
    onDelete: 'SET NULL',
  }) //카테고리가 없는 레스토랑도 있고, 카테고리를 지운다고 해도 레스토랑이 지워지면 안되기 때문에 nullable로 정의한다.
  category: Category;

  //모든 레스토랑에는 Owner가 있고 Owner가 지워지면 restaurant이 지워져야하므로 nullable 설정을 하지 않음.
  @Field(() => User)
  @ManyToOne(() => User, (user) => user.restaurants, {
    onDelete: 'CASCADE',
  })
  owner: User;
}
