//entity는 database의 모델을 생각하면 된다.

import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Order } from 'src/orders/entities/order.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, OneToMany, RelationId } from 'typeorm';
import { Category } from './category.entity';
import { Dish } from './dish.entity';
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

  @Field(() => String)
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

  //graphql에는 정의하지 않고 typeorm에만 정의해서 사용 > type script에서 restaurant의 owner column은 User타입으로 정의되어 있는데
  // 이때 새로운 owner만의 id값을 받아오고 싶기 때문이다.
  @RelationId((restaurant: Restaurant) => restaurant.owner)
  ownerId: number;

  // 하나의 레스토랑은 많은 Dish를 가짐, Dish는 하나의 레스토랑을 가짐
  @Field(() => [Dish])
  @OneToMany(() => Dish, (dish) => dish.restaurant)
  menu: Dish[];

  @Field(() => [Order])
  @OneToMany(() => Order, (order) => order.restaurant)
  orders: Order[];
}
