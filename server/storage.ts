import { db } from "./db";
import {
  users,
  products,
  cartItems,
  orders,
  orderItems,
  type User,
  type InsertUser,
  type Product,
  type InsertProduct,
  type CartItem,
  type InsertCartItem,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type CartItemWithProduct,
  type OrderWithItems
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Products
  getProducts(category?: string, brand?: string, search?: string): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;

  // Cart
  getCartItems(userId: number): Promise<CartItemWithProduct[]>;
  addCartItem(item: InsertCartItem): Promise<CartItemWithProduct>;
  updateCartItem(id: number, quantity: number): Promise<CartItemWithProduct>;
  deleteCartItem(id: number): Promise<void>;
  clearCart(userId: number): Promise<void>;

  // Orders
  getOrders(userId: number): Promise<OrderWithItems[]>;
  getOrder(id: number): Promise<OrderWithItems | undefined>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<OrderWithItems>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Products
  async getProducts(category?: string, brand?: string, search?: string): Promise<Product[]> {
    let query = db.select().from(products);
    
    // In a real app we'd add where clauses for filtering here, 
    // but for the mock we'll just return all and filter in memory for simplicity if needed,
    // or better yet just build simple queries.
    const allProducts = await query;
    return allProducts.filter(p => {
      let matches = true;
      if (category && p.category !== category) matches = false;
      if (brand && p.brand !== brand) matches = false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) matches = false;
      return matches;
    });
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  // Cart
  async getCartItems(userId: number): Promise<CartItemWithProduct[]> {
    const items = await db.select().from(cartItems).where(eq(cartItems.userId, userId));
    const result: CartItemWithProduct[] = [];
    for (const item of items) {
      const product = await this.getProduct(item.productId);
      if (product) {
        result.push({ ...item, product });
      }
    }
    return result;
  }

  async addCartItem(item: InsertCartItem): Promise<CartItemWithProduct> {
    const [newItem] = await db.insert(cartItems).values(item).returning();
    const product = await this.getProduct(newItem.productId);
    return { ...newItem, product: product! };
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItemWithProduct> {
    const [updated] = await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, id)).returning();
    const product = await this.getProduct(updated.productId);
    return { ...updated, product: product! };
  }

  async deleteCartItem(id: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(userId: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  // Orders
  async getOrders(userId: number): Promise<OrderWithItems[]> {
    const userOrders = await db.select().from(orders).where(eq(orders.userId, userId));
    const result: OrderWithItems[] = [];
    for (const order of userOrders) {
      const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
      const itemsWithProducts = [];
      for (const item of items) {
        const product = await this.getProduct(item.productId);
        if (product) {
          itemsWithProducts.push({ ...item, product });
        }
      }
      result.push({ ...order, items: itemsWithProducts });
    }
    return result;
  }

  async getOrder(id: number): Promise<OrderWithItems | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) return undefined;

    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
    const itemsWithProducts = [];
    for (const item of items) {
      const product = await this.getProduct(item.productId);
      if (product) {
        itemsWithProducts.push({ ...item, product });
      }
    }
    return { ...order, items: itemsWithProducts };
  }

  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<OrderWithItems> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    
    const itemsWithOrderId = items.map(item => ({ ...item, orderId: newOrder.id }));
    const insertedItems = await db.insert(orderItems).values(itemsWithOrderId).returning();
    
    const itemsWithProducts = [];
    for (const item of insertedItems) {
      const product = await this.getProduct(item.productId);
      if (product) {
        itemsWithProducts.push({ ...item, product });
      }
    }
    
    return { ...newOrder, items: itemsWithProducts };
  }
}

export const storage = new DatabaseStorage();
