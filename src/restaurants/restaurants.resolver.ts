import { Args, Query, Resolver } from '@nestjs/graphql';
import { Restaurant } from './entities/restaurant.entity';

//Restaurant클래스의 Resolver가 됨.
@Resolver(() => Restaurant)
export class RestaurantResolver {
  //Query가 리턴하고자 하는 타입을 리턴하는 함수가 되어야한다. (쿼리 데코레이터 안의 함수)
  @Query(() => [Restaurant])
  restaurants(@Args('veganOnly') veganOnly: boolean): Restaurant[] {
    console.log(veganOnly);
    return [];
  }
}
