import { app } from '@/firebase';
import { callFirebaseFunction } from '@/api';

export interface StripeProduct {
  id: string;
  name: string;
  description: string;
  active: boolean;
  metadata: Record<string, any>;
  price?: number;
  currency?: string;
}

export const StripeCRUD = {
  // CREATE
  async createProduct(name: string, amount: number, description: string) {
    return await callFirebaseFunction<
      { name: string; amount: number; description: string },
      { success: boolean }
    >(app, 'stripeCreateProduct', { name, amount, description });
  },

  // READ
  async listProducts() {
    return await callFirebaseFunction<void, StripeProduct[]>(app, 'stripeListProducts');
  },

  // UPDATE
  async updateProduct(productId: string, updates: Partial<StripeProduct>) {
    return await callFirebaseFunction<{ productId: string; updates: any }, { success: boolean }>(
      app,
      'stripeUpdateProduct',
      { productId, updates }
    );
  },

  // DELETE (Archive)
  async archiveProduct(productId: string) {
    return await callFirebaseFunction<{ productId: string }, { success: boolean }>(
      app,
      'stripeArchiveProduct',
      { productId }
    );
  },
};
