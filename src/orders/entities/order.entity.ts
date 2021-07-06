import {
  Field,
  Float,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import { Entity } from 'typeorm';

export enum OrderStatus {
  Pending = 'Pending',
  Cooking = 'Cooking',
  PickedUp = 'PickedUp',
  Delivered = 'Delivered',
}

registerEnumType(OrderStatus, { name: 'OrderStatus' });
@InputType('OrderInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Order extends CoreEntity {
  //1.ts , 2.gq , 3.typeorm

  @Field((type) => User)
  customer: User;

  @Field((type) => User, { nullable: true })
  driver: User;

  @Field((type) => Restaurant)
  restaurant: Restaurant;

  @Field(() => [Dish])
  dishes: Dish[];

  @Field(() => Float)
  total: number;

  @Field(() => OrderStatus)
  status: OrderStatus;
}
