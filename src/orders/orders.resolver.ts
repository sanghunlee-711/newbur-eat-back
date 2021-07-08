import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth.user.decorator';
import { Role } from 'src/auth/role.decorator';
import { User } from 'src/users/entities/user.entity';
import { CreateOrderInput, CreateOrderOutput } from './dto/create-order.dto';
import { GetOrdersInputType, GetOrdersOutputType } from './dto/get-orders.dto';
import { Order } from './entities/order.entity';
import { OrderService } from './orders.service';

@Resolver(() => Order)
export class OrderResolver {
  constructor(private readonly orderService: OrderService) {}

  @Mutation(() => CreateOrderOutput)
  @Role(['Client'])
  async createOrder(
    @AuthUser() customer: User,
    @Args('input') createOrderInput: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    return this.orderService.createOrder(customer, createOrderInput);
  }

  @Query(() => GetOrdersOutputType)
  @Role(['Any'])
  async getOrders(
    @AuthUser() user: User,
    @Args('input') getOrdersInputType: GetOrdersInputType,
  ): Promise<GetOrdersOutputType> {
    return this.orderService.getOrders(user, getOrdersInputType);
  }
}
