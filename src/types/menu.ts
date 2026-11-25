export type CategoryId = string;

export interface Category {
  id: CategoryId;
  name: string;
  emoji: string;
  subtitle: string;
  image: string;
  available?: boolean;
  sortOrder?: number;
}

export interface HeroSlide {
  id: string;
  categoryId: CategoryId;
  kicker: string;
  title: string;
  description: string;
  ctaLabel: string;
  image: string;
  available?: boolean;
  sortOrder?: number;
}

export interface DishSizeOption {
  id: string;
  label: string;
  shortLabel: string;
  weight: string;
  price: number;
}

export interface MenuItem {
  id: string;
  categoryId: CategoryId;
  name: string;
  description: string;
  weight: string;
  price: number;
  image: string;
  tag?: string;
  available?: boolean;
  sortOrder?: number;
  sizes?: DishSizeOption[];
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
}

export type DeliveryMethod = 'delivery' | 'pickup';
export type PaymentMethod = 'card' | 'cash';

export interface OrderFormData {
  customerName: string;
  phone: string;
  address: string;
  comment: string;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  consentAccepted?: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  items: CartItem[];
  customerName: string;
  phone: string;
  address: string;
  comment: string;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  paymentStatus: 'paid_online' | 'on_delivery';
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  estimatedMinutes: string;
}
