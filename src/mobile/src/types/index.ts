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
  registrationDate?: string;
  dateOfBirth?: string;
  cpf?: string;
  phone?: string;
  description?: string;
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
  number?: string;
  type?: SpotCategory;
  isAvailable?: boolean;
  ownerName?: string;
  description?: string;
  availability?: AvailabilitySlot[];
  reservations?: Reservation[];
}

export interface Reservation {
  id: string;
  spotId: string;
  spotNumber?: string;
  userId: string;
  vehiclePlate?: string | null;
  startTime: string;
  endTime: string;
  status?: 'active' | 'completed' | 'cancelled';
  createdAt?: string;
}

export interface AvailabilitySlot {
  id: string;
  spotId: string;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  recurrencePattern?: 'daily' | 'weekly' | 'monthly';
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}