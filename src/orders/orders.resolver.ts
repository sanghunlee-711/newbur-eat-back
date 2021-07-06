import { Resolver } from '@nestjs/graphql';
import { Order } from './entities/order.entity';
import { OrderService } from './orders.service';

@Resolver(() => Order)
export class OrderResolver {
  constructor(private readonly orderService: OrderService) {}
}
