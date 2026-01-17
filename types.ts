
export interface DataBundle {
  id: string;
  name: string;
  price: number;
  dataAmount: string;
  duration: 'Daily' | 'Weekly' | 'Monthly' | 'Night';
  network: 'mtn' | 'orange';
}

export interface NetworkProvider {
  id: 'mtn' | 'orange';
  name: string;
  color: string;
  apiKeyStatus: 'connected' | 'disconnected';
}

export interface GeoLocation {
  lat: number;
  lng: number;
  address?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  sellerMobile: string;
  location: GeoLocation;
  image?: string;
  category: string;
  isVerified?: boolean;
  rating?: number;
  reviews?: number;
}

export interface User {
  isLoggedIn: boolean;
  mobile?: string;
  name?: string;
  balance: number;
  language: 'en' | 'fr';
  securityPin?: string; // For wallet security
}

export interface CartItem extends Product {
  cartId: string;
  selectedQty: number;
}

export interface Transaction {
  id: string;
  type: 'data' | 'product' | 'deposit' | 'transfer' | 'merchant_pay' | 'savings' | 'group_contrib';
  amount: number;
  fee?: number; // Added fee
  description: string;
  recipient?: string;
  date: Date;
  status: 'success' | 'failed' | 'pending';
  receiptUrl?: string; // Mock PDF URL
  paymentMethod: 'WALLET' | 'OM' | 'MOMO';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  date: Date;
  type: 'info' | 'success' | 'warning';
}

export enum NavItem {
  HOME = 'home',     
  MARKET = 'market', 
  SCAN = 'scan',     
  PROFILE = 'profile' 
}

// --- NEW FINANCIAL TYPES ---

export interface SavingsGoal {
    id: string;
    title: string;
    targetAmount: number;
    currentAmount: number;
    frequency: 'Daily' | 'Weekly' | 'Monthly';
    autoDeduct: boolean;
    nextDeductDate: Date;
}

export interface ScheduledTransfer {
    id: string;
    beneficiaryName: string;
    beneficiaryNumber: string;
    amount: number;
    dayOfMonth: number; // 1-31
    status: 'active' | 'paused';
    lastStatus: 'sent' | 'pending' | 'failed';
}

export interface GroupMember {
    id: string;
    name: string;
    mobile: string;
    status: 'paid' | 'pending';
}

export interface SavingsGroup {
    id: string;
    name: string;
    contributionAmount: number;
    frequency: 'Weekly' | 'Monthly';
    members: GroupMember[];
    nextPayoutDate: Date;
    totalPool: number;
    logo: string; // URL
}
