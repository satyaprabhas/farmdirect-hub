import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import api from '../api/client';
import { useAuth } from './AuthContext';

interface CartItem {
  id: number;
  produce_id: number;
  quantity: number;
  vegetable_name: string;
  current_price: number;
  unit: string;
  farm_name: string;
  farmer_name: string;
  farmer_location: string;
  available_quantity: number;
  image_url?: string;
}

interface CartContextType {
  items: CartItem[];
  cartCount: number;
  cartTotal: number;
  deliveryFee: number;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (produceId: number, quantity: number) => Promise<void>;
  updateCartItem: (itemId: number, quantity: number) => Promise<void>;
  removeCartItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const deliveryFee = 20;

  const fetchCart = useCallback(async () => {
    if (!user || user.role !== 'CONSUMER') return;
    setIsLoading(true);
    try {
      const res = await api.get('/cart');
      setItems(res.data.items || []);
    } catch (err) {
      console.error('Failed to fetch cart', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const addToCart = async (produceId: number, quantity: number) => {
    await api.post('/cart/items', { produce_id: produceId, quantity });
    await fetchCart();
  };

  const updateCartItem = async (itemId: number, quantity: number) => {
    await api.put(`/cart/items/${itemId}`, { quantity });
    await fetchCart();
  };

  const removeCartItem = async (itemId: number) => {
    await api.delete(`/cart/items/${itemId}`);
    await fetchCart();
  };

  const clearCart = async () => {
    await api.delete('/cart');
    setItems([]);
  };

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = items.reduce((sum, item) => sum + item.quantity * item.current_price, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        cartCount,
        cartTotal,
        deliveryFee,
        isLoading,
        fetchCart,
        addToCart,
        updateCartItem,
        removeCartItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
