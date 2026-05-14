export interface Category {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  description?: string | null;
  catalog?: "BAKERY" | "RESTAURANT";
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  weight: string | null;
  imageUrl: string | null;
  isAvailable: boolean;
  isHalal: boolean;
  sortOrder: number;
  categoryId: string;
  /** null — остаток не ограничиваем */
  stockQuantity?: number | null;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
  /** null — без лимита по складу */
  stockQuantity?: number | null;
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product?: {
    name: string;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  deliveryType: "DELIVERY" | "PICKUP";
  address: string | null;
  status: OrderStatus;
  totalAmount: number;
  bonusUsed: number;
  bonusEarned: number;
  comment: string | null;
  paymentMethod: string | null;
  guestName: string | null;
  guestPhone: string | null;
  items: OrderItem[];
  createdAt: Date;
  user?: {
    name: string | null;
    phone: string;
  };
}

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "DELIVERING"
  | "COMPLETED"
  | "CANCELLED";

export interface Settings {
  delivery_price: string;
  delivery_free_from: string;
  bonus_percent: string;
  min_order_amount: string;
  working_hours_weekday: string;
  working_hours_weekend: string;
  address: string;
  phone: string;
}