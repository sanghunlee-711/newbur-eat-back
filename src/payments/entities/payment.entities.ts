import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';

@InputType('PaymentInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Payment extends CoreEntity {
  @Field(() => String)
  @Column()
  transactionId: string;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.payments, {
    nullable: true,
  })
  user: User;

  @RelationId((payment: Payment) => payment.user)
  userId: number;

  // 레스토랑에서 payment로 접근할 일이 없기 때문에 retaurant entity에 따로 restaurant를 선언해주지 않는다.
  // 그리고 reverse relation도 따로 선언해주지 않는다.
  // 공식문서를 보면 설명잘되어있음 oneTomany는 이렇게 선언하지 못함 ㅎㅅㅎ
  @Field(() => Restaurant)
  @ManyToOne(() => Restaurant)
  restaurant: Restaurant;

  @RelationId((payment: Payment) => payment.restaurant)
  @Field(() => Int)
  restaurantId: number;
}
