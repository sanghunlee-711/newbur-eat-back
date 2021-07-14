# Nuber Eats Clone with NomadCode

The Backend Folder

## User Entity:

- id
- createdAt
- updatedAt

- email
- password
- role(client | owner | delivery)

## User CRUD:

- Created Account
- Log In

## Restaurant Model

- name
- category (foreign key)
- address
- coverImage

### Resutaurants function

- Edit Restaurant
- Delete Restaurant

- See Categories
- See Restaurants by Category(pagination)
- See Restaurants (pagination)
- See Restaurant
- Search Restaurants

- Create Dish
- Edit Dish
- Delete Dish

- Orders CRUD
- Orders Subscription(Owner, Customer, Delivery)

- Payment with Paddle (CRON)

## Subscription

- Orders Subscription:
  - Pending Orders (Owner) (s: newOrder) (t: createOrder(newOrder))
  - Order Status (Customer, Owner, Delivery) (s: orderUpdate) (t: editOrder(orderUpdate))
  - Pending Pickup Order (Delivery) (s: orderUpdate) (t: editOrder(orderUpdate))
