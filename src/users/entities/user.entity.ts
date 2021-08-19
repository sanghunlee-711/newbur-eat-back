import { InternalServerErrorException } from '@nestjs/common';
import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import * as bcrypt from 'bcrypt';
import { IsBoolean, IsEmail, IsEnum, IsString } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Payment } from 'src/payments/entities/payment.entities';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from 'typeorm';

// type UserRole = 'client' | 'owenr' | 'delivery';

export enum UserRole {
  Client = 'Client',
  Owner = 'Owner',
  Delivery = 'Delivery',
}

registerEnumType(UserRole, { name: 'UserRole' });

@InputType('UserInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity {
  @Column({ unique: true })
  @Field(() => String)
  @IsEmail()
  email: string;

  @Column({ select: false }) //typeorm으로 user객체를 불러올때 패스워드 컬럼을 제외하는 설정
  @Field(() => String)
  @IsString()
  password: string;

  @Column({ type: 'enum', enum: UserRole }) // for DB
  @Field(() => UserRole) //for graphql
  @IsEnum(UserRole)
  role: UserRole;

  @Column({ default: false })
  @Field(() => Boolean)
  @IsBoolean()
  verified: boolean;

  @Column({ default: 'N/A' })
  @Field(() => String)
  @IsString()
  address: string;

  @Field(() => [Restaurant])
  @OneToMany(() => Restaurant, (restaurant) => restaurant.owner)
  restaurants: Restaurant[];

  //one user can have many user
  @Field(() => [Order])
  @OneToMany(() => Order, (order) => order.customer)
  orders: Order[];

  @Field(() => [Payment])
  @OneToMany(() => Payment, (payment) => payment.user)
  payments: Payment[];

  @Field(() => [Order])
  @OneToMany(() => Order, (order) => order.driver)
  rides: Order[];

  @BeforeInsert() //before save in DB with save method in service.ts do this method, when users instance is made by create method
  @BeforeUpdate()
  async hasPassword(): Promise<void> {
    if (this.password) {
      //만약 save, update등의 메서드에서 password를 넘겼을때만 hash를 진행하게 만듦(이렇게 조건을 걸어두며 해시한것을 다시 해시하지는 않음)
      try {
        this.password = await bcrypt.hash(this.password, 10);
      } catch (error) {
        console.error(error);
        throw new InternalServerErrorException();
      }
    }
  }

  async checkPassword(aPassword: string): Promise<boolean> {
    try {
      const ok = await bcrypt.compare(aPassword, this.password);
      return ok;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException();
    }
  }
}
