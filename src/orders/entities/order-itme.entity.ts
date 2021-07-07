import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@ObjectType()
@InputType('OrderItmeOptionInputType', { isAbstract: true })
export class OrderItmeOption {
  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  choice?: string;
}

@InputType('OrderItemInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class OrderItem extends CoreEntity {
  //이렇게 따로 옵션을 위한 Entity를 만드는 이유는 주문을 할때 주문에 따른 옵션만을 제공하는 것 +
  // 관계설정을 리버스로 하지 않은 이유는 order item쪽에서 Dish로 접근할 필요가 없기 때문이다.
  @Field(() => Dish, { nullable: true })
  @ManyToOne(() => Dish, { nullable: true, onDelete: 'CASCADE' })
  dish: Dish;

  @Field(() => [OrderItmeOption], { nullable: true })
  @Column({ type: 'json', nullable: true })
  options?: OrderItmeOption[];
}
