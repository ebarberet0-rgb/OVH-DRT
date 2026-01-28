export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface Dealer {
  id: string;
  name: string;
  city: string;
}

export interface Motorcycle {
  id: string;
  model: string;
  number: number;
  group: 1 | 2;
  imageUrl?: string;
  status: 'AVAILABLE' | 'UNAVAILABLE';
}

export interface Booking {
  id: string;
  userId: string;
  motorcycleId: string;
  timeSlot: string;
  status: 'RESERVED' | 'CONFIRMED' | 'READY' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  user: User;
  motorcycle: Motorcycle;
  waiverSigned: boolean;
  waiverSignatureUrl?: string;
  licensePhotoUrl?: string;
  bibNumber?: number;
  confirmedAt?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface Event {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  dealerId: string;
  dealer: Dealer;
  motorcycles: Motorcycle[];
  bookings: Booking[];
}

export interface BreakdownReport {
  motorcycleId: string;
  type: 'CRASH' | 'MECHANICAL' | 'OTHER';
  description: string;
  photoUrl?: string;
  blockFutureBookings: boolean;
}
