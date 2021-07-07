import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateOrderInput, CreateOrderOutput } from './dto/create-order.dto';
import { OrderItem } from './entities/order-itme.entity';
import { Order } from './entities/order.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItems: Repository<OrderItem>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
  ) {}

  async createOrder(
    customer: User,
    { restaurantId, items }: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    const restaurant = await this.restaurants.findOne(restaurantId);

    try {
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }
      //forEach로 에러 핸들링을 위해 return을 한다고 해도 return이 되지 않아서 실행이 될것임
      //그래서 for of로 변경 예정
      items.forEach(async (item) => {
        const dish = await this.dishes.findOne(item.dishId);

        if (!dish) {
          //abort this whole thing
          return {
            ok: false,
            errork: 'Could not find dish',
          };
        }

        await this.orderItems.save(
          this.orderItems.create({ dish, options: item.options }),
        );
      });

      //1. order 만듬
      // const order = await this.orders.save(
      //   this.orders.create({ customer, restaurant }),
      // );
      // console.log(order);
      //2. item 추가

      return { ok: true };
    } catch (error) {
      return { ok: false, error };
      console.log(error);
    }
  }
}
