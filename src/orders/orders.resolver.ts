import { Inject } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { AuthUser } from 'src/auth/auth.user.decorator';
import { Role } from 'src/auth/role.decorator';
import { PUB_SUB } from 'src/common/common.constants';
import { User } from 'src/users/entities/user.entity';
import { CreateOrderInput, CreateOrderOutput } from './dto/create-order.dto';
import { EditOrderInput, EditOrderOutput } from './dto/edit-order.dto';
import { GetOrderInput, GetOrderOutput } from './dto/get-order.dto';
import { GetOrdersInput, GetOrdersOutput } from './dto/get-orders.dto';
import { Order } from './entities/order.entity';
import { OrderService } from './orders.service';

@Resolver(() => Order)
export class OrderResolver {
  constructor(
    private readonly orderService: OrderService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  @Mutation(() => CreateOrderOutput)
  @Role(['Client'])
  async createOrder(
    @AuthUser() customer: User,
    @Args('input') createOrderInput: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    return this.orderService.createOrder(customer, createOrderInput);
  }

  @Query(() => GetOrdersOutput)
  @Role(['Any'])
  async getOrders(
    @AuthUser() user: User,
    @Args('input') getOrdersInput: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    return this.orderService.getOrders(user, getOrdersInput);
  }

  @Query(() => GetOrderOutput)
  @Role(['Any'])
  async getOrder(
    @AuthUser() user: User,
    @Args('input') getOrderInput: GetOrderInput,
  ): Promise<GetOrderOutput> {
    return this.orderService.getOrder(user, getOrderInput);
  }

  @Mutation(() => EditOrderOutput)
  @Role(['Any'])
  async editOrder(
    @AuthUser() user: User,
    @Args('input') editOrderInput: EditOrderInput,
  ): Promise<EditOrderOutput> {
    return this.orderService.editOrder(user, editOrderInput);
  }

  @Mutation(() => Boolean)
  async potatoReady(@Args('potatoId') potatoId: number) {
    //potatoReady는 asyncIterator(hotPotatos)를 발생시키는 작업을 한다.
    //트리거 이름과 publish이름은 같아야함(hotPotato)
    //publish의 payload는 객체여야하고 Mutation function과 이름이 같으면 됨 readyPotato
    await this.pubSub.publish('hotPotato', {
      readyPotato: potatoId,
    });
    return true;
  }

  @Subscription(() => String, {
    //현재 listening하는 사용자가 update알림을 받아야할지 말지를 결정해주는 함수가 filter
    filter: ({ readyPotato }, { potatoId }) => {
      // filter메서드에서는 3가지 인자를 받을 수 있는데 payload, variables, context임
      // filtering을 위해서 pubSub.publish로 받는 인자가 payload,
      // subScription 데코레이터가 달려있는 메서드에서 args로 받는 것이 variables임
      // 그 두가지를 비교해서 filtering을 하게 됨
      return readyPotato === potatoId;
    },
    //사용자가 받는 알림의 형태를 바꿔주는 함수가 resolve
    resolve: ({ readyPotato }) =>
      `Your potato with the id ${readyPotato} is Ready!`,
  })
  @Role(['Any'])
  readyPotato(@Args('potatoId') potatoId: number) {
    //특정 mutation을 리스닝하기 위해 asyncIterator를 사용
    return this.pubSub.asyncIterator('hotPotato');
  }
}
