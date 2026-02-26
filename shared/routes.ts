import { z } from 'zod';
import { insertProductSchema, insertUserSchema, insertCartItemSchema, insertOrderSchema } from './schema';
import type { Product, User, CartItemWithProduct, OrderWithItems } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/auth/login' as const,
      input: z.object({
        email: z.string().email(),
        password: z.string(),
      }),
      responses: {
        200: z.object({ user: z.custom<Omit<User, 'password'>>(), token: z.string() }),
        401: errorSchemas.unauthorized,
      },
    },
    register: {
      method: 'POST' as const,
      path: '/api/auth/register' as const,
      input: z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().min(2),
      }),
      responses: {
        201: z.object({ user: z.custom<Omit<User, 'password'>>(), token: z.string() }),
        400: errorSchemas.validation,
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/auth/me' as const,
      responses: {
        200: z.custom<Omit<User, 'password'>>(),
        401: errorSchemas.unauthorized,
      }
    }
  },
  products: {
    list: {
      method: 'GET' as const,
      path: '/api/products' as const,
      input: z.object({
        category: z.string().optional(),
        brand: z.string().optional(),
        search: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<Product>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/products/:id' as const,
      responses: {
        200: z.custom<Product>(),
        404: errorSchemas.notFound,
      },
    },
  },
  cart: {
    list: {
      method: 'GET' as const,
      path: '/api/cart' as const,
      responses: {
        200: z.array(z.custom<CartItemWithProduct>()),
        401: errorSchemas.unauthorized,
      },
    },
    add: {
      method: 'POST' as const,
      path: '/api/cart' as const,
      input: z.object({
        productId: z.number(),
        size: z.string(),
        quantity: z.number().min(1).default(1),
      }),
      responses: {
        201: z.custom<CartItemWithProduct>(),
        401: errorSchemas.unauthorized,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/cart/:id' as const,
      input: z.object({
        quantity: z.number().min(1),
      }),
      responses: {
        200: z.custom<CartItemWithProduct>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/cart/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  orders: {
    list: {
      method: 'GET' as const,
      path: '/api/orders' as const,
      responses: {
        200: z.array(z.custom<OrderWithItems>()),
        401: errorSchemas.unauthorized,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/orders/:id' as const,
      responses: {
        200: z.custom<OrderWithItems>(),
        404: errorSchemas.notFound,
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/orders' as const,
      input: z.object({
        shippingAddress: z.any(), // JSON
      }),
      responses: {
        201: z.custom<OrderWithItems>(),
        400: errorSchemas.validation,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
