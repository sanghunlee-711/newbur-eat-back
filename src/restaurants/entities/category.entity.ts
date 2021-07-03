import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Restaurant } from './restaurant.entity';

@InputType('CategoryInputType', { isAbstract: true })
@ObjectType() //@ObjectType은 graphql이 자동으로 스키마를 빌드하기 위해 사용하는 Graphql decorator이다.
@Entity() //@Entity는 TypeOrm이 db에 정의한 schema를 저장하게 해주기위해 사용하는 데코레이터이다.
export class Category extends CoreEntity {
  @Field(() => String)
  @Column({ unique: true })
  @IsString()
  @Length(5)
  name: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  coverImg: string;

  @Field(() => String)
  @Column({ unique: true })
  @IsString()
  slug: string;

  //하나의 카테고리는 많은 레스토랑을 가짐, 레스토랑은 하나의 카테고리만 가짐
  @Field(() => [Restaurant], { nullable: true })
  @OneToMany(() => Restaurant, (restaurant) => restaurant.category) //TYPEORM에서 관계정의시 inverse또한 정의를 해줘야함.
  restaurants: Restaurant[];
}
