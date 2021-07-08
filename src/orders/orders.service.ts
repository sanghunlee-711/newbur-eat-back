import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User, UserRole } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateOrderInput, CreateOrderOutput } from './dto/create-order.dto';
import { GetOrderInput, GetOrderOutput } from './dto/get-order.dto';
import { GetOrdersInput, GetOrdersOutput } from './dto/get-orders.dto';
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
      let orderFinalPrice = 0;
      const orderItems: OrderItem[] = [];
      for (const item of items) {
        const dish = await this.dishes.findOne(item.dishId);

        if (!dish) {
          //abort this whole thing
          return {
            ok: false,
            error: 'Dish not found',
          };
        }
        let dishFinalPrice = dish.price;
        console.log(`Dish Price : ${dish.price}`);
        for (const itemOption of item.options) {
          const dishOption = dish.options.find(
            (dishOption) => dishOption.name === itemOption.name,
          );
          if (dishOption.extra) {
            dishFinalPrice = dishFinalPrice + dishOption.extra;
            console.log(`$USD + ${dishOption.extra}`);
          } else {
            const dishOptionsChoice = dishOption.choices.find(
              (optionChoice) => optionChoice.name === itemOption.choice,
            );

            if (dishOptionsChoice) {
              if (dishOptionsChoice.extra) {
                dishFinalPrice = dishFinalPrice + dishOptionsChoice.extra;
                console.log(
                  `$USD + ${dishOptionsChoice.extra} > optionChoice extra`,
                );
              }
            }
            console.log(dishOptionsChoice);
          }
        }
        orderFinalPrice = orderFinalPrice + dishFinalPrice;

        //주문 아이템 추가
        const orderItem = await this.orderItems.save(
          this.orderItems.create({
            dish,
            options: item.options,
          }),
        );
        orderItems.push(orderItem);
      }

      await this.orders.save(
        this.orders.create({
          customer,
          restaurant,
          total: orderFinalPrice,
          items: orderItems,
        }),
      );

      return { ok: true };
    } catch (error) {
      return { ok: false, error: 'Could not create order' };
    }
  }

  async getOrders(
    user: User,
    { status }: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    try {
      let orders: Order[];

      if (user.role === UserRole.Client) {
        orders = await this.orders.find({
          where: { customer: user, ...(status && { status }) },
        });
      } else if (user.role === UserRole.Delivery) {
        orders = await this.orders.find({
          where: { driver: user, ...(status && { status }) },
        });
      } else if (user.role === UserRole.Owner) {
        const restaurants = await this.restaurants.find({
          where: { owner: user },
          relations: ['orders'],
        });
        // console.log(restaurants);

        orders = restaurants.map((restaurant) => restaurant.orders).flat(1);
        if (status) {
          orders = orders.filter((order) => order.status === status);
        }

        // //flat은 배열 한단계 앞으로 꺼내주는 역할이고 reduce메서드로도 재현가능함 -> js에서는 es 2019부터 사용가능
        // console.log(
        //   restaurants
        //     .map((restaurant) => restaurant.orders)
        //     .reduce((acc, val) => acc.concat(val), []),
        // );
        // console.log(orders);
      }
      return { ok: true, orders };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not get orders',
      };
    }
  }

  async getOrder(
    user: User,
    //객체 구조분해 하면서 이름 바꿔주고 싶으면 아래와 같이 하면됨 (기존id , 변경:orderId)
    { id: orderId }: GetOrderInput,
  ): Promise<GetOrderOutput> {
    try {
      const order = await this.orders.findOne(orderId, {
        relations: ['restaurant'],
      });
      if (!order) {
        return {
          ok: false,
          error: 'order not found',
        };
      }

      //under for rejecting different id
      let canSee = true;
      if (user.role === UserRole.Client && order.customerId !== user.id) {
        canSee = false;
      }

      if (user.role === UserRole.Delivery && order.driverId !== user.id) {
        canSee = false;
      }

      if (
        user.role === UserRole.Owner &&
        order.restaurant.ownerId !== user.id
      ) {
        canSee = false;
      }

      if (!canSee) {
        return {
          ok: false,
          error: "You can't see that",
        };
      }

      return {
        ok: true,
        order,
      };
    } catch {
      return { ok: false, error: 'Could not load order' };
    }
  }
}
