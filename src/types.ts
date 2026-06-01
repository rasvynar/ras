/**
 * Brand Identity & E-Commerce Core Types
 * RASVYNAR - Style Beyond Ordinary
 */

export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'STAFF' | 'CUSTOMER';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string; // WhatsApp formatted 628xxxxxxxx
  address: string;
  provinceStr?: string;
  cityStr?: string;
  districtStr?: string;
  postalCode?: string;
  role: Role;
  avatarUrl?: string;
  isActive: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  referralCode?: string;
  referredBy?: string;
  membershipLevel: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  loyaltyPoints: number;
}

export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  ipAddress: string;
  country: string;
  city: string;
  device: string;
  browser: string;
  fingerprint: string;
  riskScore: number; // calculated scale 0-100
  isSuspicious: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  details?: string; // rich Markdown or specifications
  price: number;
  discountPrice?: number;
  stock: number;
  weight: number; // in grams
  sku: string;
  categoryId: string;
  images: string[]; // gallery paths/urls
  rating: number;
  salesCount: number;
  sizes: ('S' | 'M' | 'L' | 'XL' | 'XXL')[];
  colors: string[]; // dynamically maintained dynamic colors
  isNew?: boolean;
}

export interface CartItem {
  productId: string;
  quantity: number;
  size: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  color: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  color: string;
  image: string;
}

export type OrderStatus = 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  shippingFee: number;
  discountAmount: number;
  pointsEarned: number;
  couponCodeUsed?: string;
  
  // Shipping Details
  shippingName: string;
  shippingPhone: string;
  shippingEmail: string;
  shippingAddress: string;
  shippingProvince: string;
  shippingCity: string;
  shippingDistrict: string;
  shippingPostalCode: string;
  shippingCourier: 'JNE' | 'J&T' | 'SICEPAT' | 'POS' | 'ANTERAJA';
  shippingTrackingNumber?: string;
  shippingStatus?: string;
  shippingDistanceKm?: number;
  
  // Maps Verification Detail
  latitude?: number;
  longitude?: number;
  googlePlaceId?: string;

  createdAt: string;
}

export interface PaymentDetails {
  orderId: string;
  paymentMethod: string; // e.g. "BCA VA", "DANA", "QRIS"
  accountNumber?: string; // VA number or instructions
  paymentDate?: string;
  transactionStatus: 'PENDING' | 'SETTLEMENT' | 'EXPIRED' | 'CANCELLED';
  amount: number;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1-5
  comment: string;
  images?: string[];
  createdAt: string;
}

export interface Coupon {
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  minSpend?: number;
  maxDiscount?: number;
  expiresAt: string;
  isActive: boolean;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  isActive: boolean;
}

export interface SystemSettings {
  brandName: string;
  tagline: string;
  emailAdmin: string;
  phoneBusiness: string; // WhatsApp
  addressBusiness: string;
  shippingBasePrice: number; // base flat rate per km
  midtransServerKey?: string;
  xenditApiKey?: string;
  googleMapsApiKey?: string;
  cloudinaryUrl?: string;
  installationCompleted: boolean;
}

export interface CMSPages {
  aboutUs: string;
  contact: string;
  faq: string;
  privacyPolicy: string;
  termsOfService: string;
  returnRefundPolicy: string;
  shippingPolicy: string;
  sizeGuide: string;
}
