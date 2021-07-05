import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsNumber, IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { Restaurant } from './restaurant.entity';

@InputType('DishOptionsInputType', { isAbstract: true })
@ObjectType()
class DishOption {
  @Field(() => String)
  name: string;

  @Field(() => [String])
  choices: string[];

  @Field(() => Number)
  extra: number;
}

@InputType('DishInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Dish extends CoreEntity {
  @Field(() => String)
  @Column({ unique: true })
  @IsString()
  @Length(5)
  name: string;

  @Field(() => Int)
  @Column()
  @IsNumber()
  price: number;

  @Field(() => String)
  @Column({ unique: true })
  @IsString()
  //may be url
  photo: string;

  @Field(() => String)
  @Column()
  @Length(5, 140)
  description: string;

  // 하나의 레스토랑은 많은 Dish를 가짐, Dish는 하나의 레스토랑을 가짐
  @Field(() => Restaurant, { nullable: true })
  @ManyToOne(() => Restaurant, (restaurant) => restaurant.menu, {
    onDelete: 'CASCADE', //if the restaurant is deleted the dish would be delted
  })
  restaurant: Restaurant;

  @RelationId((dish: Dish) => dish.restaurant)
  restaurantId: number;

  //Dish options 를 entity에 넣고싶지 않아서 json파일로 저장할 수 있게됨
  //정형화된 데이터라고 판단되고 굳이 CRUD메서드를 리졸버에서 만드는 수고를하고 싶지 않을 때, 해야할 필요가 없을 때 사용할 수 있음.
  @Field(() => [DishOption])
  @Column({ type: 'json' })
  options: DishOption[];
}
