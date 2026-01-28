import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import type { Event, Booking, Motorcycle, BreakdownReport } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authentication token to requests
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Re-export types for convenience
export type { Event, Booking, Motorcycle, BreakdownReport };

export const eventsApi = {
  // Get all events for current user
  getEvents: () => api.get<Event[]>('/api/events'),

  // Get single event with full details
  getEvent: (eventId: string) => api.get<Event>(`/api/events/${eventId}`),

  // Get bookings for an event (optional date filter)
  getEventBookings: (eventId: string, date?: string) =>
    api.get<Booking[]>(`/api/events/${eventId}/bookings`, {
      params: { date },
    }),
};

export const bookingsApi = {
  // Confirm client presence
  confirmPresence: (bookingId: string) =>
    api.post(`/api/bookings/${bookingId}/confirm`),

  // Start test ride
  startRide: (bookingId: string) =>
    api.post(`/api/bookings/${bookingId}/start`),

  // Complete test ride
  completeRide: (bookingId: string) =>
    api.post(`/api/bookings/${bookingId}/complete`),

  // Cancel booking
  cancelBooking: (bookingId: string) =>
    api.post(`/api/bookings/${bookingId}/cancel`),

  // Update booking documents
  updateDocuments: (
    bookingId: string,
    data: {
      waiverSigned?: boolean;
      waiverSignatureUrl?: string;
      licensePhotoUrl?: string;
      bibNumber?: number;
    }
  ) => api.patch(`/api/bookings/${bookingId}/documents`, data),

  // Create walk-in booking
  createWalkIn: (data: {
    eventId: string;
    motorcycleId: string;
    timeSlot: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }) => api.post('/api/bookings/walk-in', data),

  // Start entire group (column)
  startGroup: (eventId: string, timeSlot: string) =>
    api.post(`/api/events/${eventId}/start-group`, { timeSlot }),

  // Complete entire group
  completeGroup: (eventId: string, timeSlot: string) =>
    api.post(`/api/events/${eventId}/complete-group`, { timeSlot }),
};

export const motorcyclesApi = {
  // Report motorcycle breakdown
  reportBreakdown: (motorcycleId: string, data: BreakdownReport) =>
    api.post(`/api/motorcycles/${motorcycleId}/breakdown`, data),

  // Update motorcycle status
  updateStatus: (motorcycleId: string, status: 'AVAILABLE' | 'UNAVAILABLE') =>
    api.patch(`/api/motorcycles/${motorcycleId}/status`, { status }),
};

export const photosApi = {
  // Upload event photo
  uploadPhoto: (eventId: string, formData: FormData) =>
    api.post(`/api/events/${eventId}/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  // Get event photos
  getPhotos: (eventId: string) =>
    api.get(`/api/events/${eventId}/photos`),
};

export const usersApi = {
  search: (query: string) => api.get('/api/users', { params: { search: query, role: 'CLIENT' } }),
};

export default api;
