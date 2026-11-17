export type UserRole = 'resident' | 'manager';
export type UserStatus = 'pending' | 'approved' | 'denied';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  condominiumId: string;
  condominiumName?: string;
  apartment?: string;
  block?: string;
  createdAt?: string;
}

export interface Condominium {
  id: string;
  name: string;
  address?: string;
}

export type SpotCategory = 'compact' | 'standard' | 'suv' | 'motorcycle';
export type SpotStatus = 'available' | 'occupied' | 'reserved';

export interface Spot {
  id: string;
  spotNumber: string;
  location: string;
  category: SpotCategory;
  status: SpotStatus;
  condominiumId: string;
  ownerId?: string;
}

export interface Reservation {
  id: string;
  spotId: string;
  spotNumber?: string;
  userId: string;
  vehiclePlate: string;
  startTime: string;
  endTime: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}