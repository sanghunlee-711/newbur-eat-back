import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateRestaurantDto } from './dtos/create-restaurant.dto';
import { UpdateRestaurantDto } from './dtos/update-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './restaurants.service';

//Restaurant클래스의 Resolver가 됨.
@Resolver(() => Restaurant)
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantService) {}
  //Query가 리턴하고자 하는 타입을 리턴하는 함수가 되어야한다. (쿼리 데코레이터 안의 함수)
  //그래프큐엘에서 리턴하는 타입의 표현이랑 ts에서 리턴하는 표현의 차이를 기억하자
  //nest js에서는필요한것을 요청해야함, arguments는 자동으로 나타나지 않기 때문에 @Args로 지정해주고 요청해야하며 타입을 지정해줘야한다.

  @Query(() => [Restaurant])
  restaurants(): Promise<Restaurant[]> {
    return this.restaurantService.getAll();
  }

  //createRestaurant 에 일일이 arguments로서 restaurant.entity.ts에 있는 필드들을 필요한 것만 정의해서 Arg를 길게 가져 가도 됨
  // 그러나 inputType을 설정하여 객체를 전체로 넘겨서 쓸 수 도 있음
  @Mutation(() => Boolean)
  async createRestaurant(
    @Args('input') createRestaurantDto: CreateRestaurantDto,
  ): Promise<boolean> {
    try {
      await this.restaurantService.createRestaurant(createRestaurantDto);
      console.log(createRestaurantDto);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  @Mutation(() => Boolean)
  async updateRestaurant(
    @Args('input') UpdateRestaurantDto: UpdateRestaurantDto,
  ): Promise<boolean> {
    try {
      await this.restaurantService.updateRestaurant(UpdateRestaurantDto);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
