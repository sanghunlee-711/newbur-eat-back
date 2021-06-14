import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRestaurantDto } from './dtos/create-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
  ) {}

  getAll(): Promise<Restaurant[]> {
    //DB에 접근하는 방식을 여기서 작성하게 됨
    //여기서의 restaurants가 restaurant entity의 respository이다.
    return this.restaurants.find();
  }

  createRestaurant(
    createRestaurantDto: CreateRestaurantDto,
  ): Promise<Restaurant> {
    //create 와 save의 차이를 보자
    const newRestaurant = this.restaurants.create(createRestaurantDto); // create는 instance를 만들어 줌 -> DB를 실제로 건들지는 않는다는 말.
    //DB에 실제로 저장하고 싶으면 save를 사용하면 된다.
    return this.restaurants.save(newRestaurant);
  }
}
