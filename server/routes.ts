import type { Express } from 'express';
import type { Server } from 'http';
import { storage } from './storage';
import { api } from '@shared/routes';
import { z } from 'zod';

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  // Simple mock auth middleware for demo purposes
  // In a real app we'd use proper sessions or JWT verification here
  app.use((req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      // For mock purposes, token is just the user id
      const userId = parseInt(token);
      if (!isNaN(userId)) {
        req.user = { id: userId } as any;
      }
    } else {
      // Mock logged in user for easier testing if no token is provided
      req.user = { id: 1 } as any;
    }
    next();
  });

  // Auth Routes
  app.post(api.auth.login.path, async (req, res) => {
    try {
      const input = api.auth.login.input.parse(req.body);
      const user = await storage.getUserByEmail(input.email);

      if (!user || user.password !== input.password) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const { password, ...userWithoutPassword } = user;
      // Mock token is just the user ID for simplicity
      res.json({ user: userWithoutPassword, token: user.id.toString() });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res
          .status(400)
          .json({
            message: err.errors[0].message,
            field: err.errors[0].path.join('.'),
          });
      }
      throw err;
    }
  });

  app.post(api.auth.register.path, async (req, res) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      const existingUser = await storage.getUserByEmail(input.email);

      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
      }

      const user = await storage.createUser({
        email: input.email,
        password: input.password,
        name: input.name,
      });

      const { password, ...userWithoutPassword } = user;
      res
        .status(201)
        .json({ user: userWithoutPassword, token: user.id.toString() });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res
          .status(400)
          .json({
            message: err.errors[0].message,
            field: err.errors[0].path.join('.'),
          });
      }
      throw err;
    }
  });

  app.get(api.auth.me.path, async (req, res) => {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await storage.getUser(userId);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  // Products Routes
  app.get(api.products.list.path, async (req, res) => {
    const { category, brand, search } = req.query;
    const products = await storage.getProducts(
      category as string | undefined,
      brand as string | undefined,
      search as string | undefined,
    );
    res.json(products);
  });

  app.get(api.products.get.path, async (req, res) => {
    const product = await storage.getProduct(Number(req.params.id));
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  });

  // Cart Routes
  app.get(api.cart.list.path, async (req, res) => {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const items = await storage.getCartItems(userId);
    res.json(items);
  });

  app.post(api.cart.add.path, async (req, res) => {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    try {
      const input = api.cart.add.input.parse(req.body);
      const item = await storage.addCartItem({
        userId,
        productId: input.productId,
        size: input.size,
        quantity: input.quantity,
      });
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res
          .status(400)
          .json({
            message: err.errors[0].message,
            field: err.errors[0].path.join('.'),
          });
      }
      throw err;
    }
  });

  app.put(api.cart.update.path, async (req, res) => {
    try {
      const input = api.cart.update.input.parse(req.body);
      const item = await storage.updateCartItem(
        Number(req.params.id),
        input.quantity,
      );
      res.json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res
          .status(400)
          .json({
            message: err.errors[0].message,
            field: err.errors[0].path.join('.'),
          });
      }
      throw err;
    }
  });

  app.delete(api.cart.delete.path, async (req, res) => {
    await storage.deleteCartItem(Number(req.params.id));
    res.status(204).send();
  });

  // Orders Routes
  app.get(api.orders.list.path, async (req, res) => {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const orders = await storage.getOrders(userId);
    res.json(orders);
  });

  app.get(api.orders.get.path, async (req, res) => {
    const order = await storage.getOrder(Number(req.params.id));
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Check if user owns order
    const userId = (req as any).user?.id;
    if (order.userId !== userId)
      return res.status(401).json({ message: 'Unauthorized' });

    res.json(order);
  });

  app.post(api.orders.create.path, async (req, res) => {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    try {
      const input = api.orders.create.input.parse(req.body);

      // Get cart items to convert to order
      const cartItems = await storage.getCartItems(userId);
      if (cartItems.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
      }

      // Calculate total
      const totalAmount = cartItems.reduce(
        (sum, item) => sum + Number(item.product.price) * item.quantity,
        0,
      );

      // Create order
      const order = await storage.createOrder(
        {
          userId,
          totalAmount: totalAmount.toString(),
          status: 'pending',
          shippingAddress: input.shippingAddress,
        },
        cartItems.map((item) => ({
          orderId: 0, // Will be set by storage
          productId: item.productId,
          size: item.size,
          quantity: item.quantity,
          price: item.product.price.toString(),
        })),
      );

      // Clear cart
      await storage.clearCart(userId);

      res.status(201).json(order);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res
          .status(400)
          .json({
            message: err.errors[0].message,
            field: err.errors[0].path.join('.'),
          });
      }
      throw err;
    }
  });

  // Seed DB on startup if empty
  seedDatabase().catch(console.error);

  return httpServer;
}

async function seedDatabase() {
  const existingProducts = await storage.getProducts();
  if (existingProducts.length === 0) {
    // Seed Products
    await storage.createProduct({
      name: 'Air Max Pro',
      description:
        'Premium comfort and responsive cushioning for your everyday run.',
      price: '159.99',
      imageUrl:
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070',
      category: 'shoes',
      brand: 'Nike',
      color: 'Red/White',
      sizes: ['8', '9', '10', '11', '12'],
      featured: true,
    });

    await storage.createProduct({
      name: 'Yeezy Boost',
      description: 'Iconic streetwear sneaker with unparalleled comfort.',
      price: '220.00',
      imageUrl:
        'https://images.unsplash.com/photo-1512374382149-233c42b6a83b?q=80&w=1965',
      category: 'shoes',
      brand: 'Adidas',
      color: 'White',
      sizes: ['7', '8', '9', '10', '11'],
      featured: true,
    });

    await storage.createProduct({
      name: 'Classic Leather',
      description:
        'Timeless style meets modern comfort in this premium leather sneaker.',
      price: '85.00',
      imageUrl:
        'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=1998',
      category: 'shoes',
      brand: 'Reebok',
      color: 'Yellow/Blue',
      sizes: ['8', '9', '10', '11'],
      featured: false,
    });

    await storage.createProduct({
      name: 'Premium Oxford Shirt',
      description:
        'A tailored fit oxford shirt made from premium breathable cotton.',
      price: '65.00',
      imageUrl:
        'https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?q=80&w=1888',
      category: 'mens-wear',
      brand: 'Zara',
      color: 'Light Blue',
      sizes: ['S', 'M', 'L', 'XL'],
      featured: true,
    });

    await storage.createProduct({
      name: 'Slim Fit Chinos',
      description: 'Comfortable and stylish stretch chinos for everyday wear.',
      price: '49.90',
      imageUrl:
        'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=1994',
      category: 'mens-wear',
      brand: 'H&M',
      color: 'Khaki',
      sizes: ['30', '32', '34', '36'],
      featured: false,
    });

    // Seed mock user
    const existingUser = await storage.getUserByEmail('demo@example.com');
    if (!existingUser) {
      await storage.createUser({
        email: 'demo@example.com',
        password: 'password123',
        name: 'Demo User',
        address: {
          street: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          zip: '94105',
          country: 'USA',
        },
      });
    }
  }
}
