import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

// API Endpoints
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),
  register: (data: any) => api.post('/api/auth/register', data),
  getProfile: () => api.get('/api/auth/profile'),
};

export const usersApi = {
  getAll: (params?: any) => api.get('/api/users', { params }),
  getById: (id: string) => api.get(`/api/users/${id}`),
  create: (data: any) => api.post('/api/users', data),
  update: (id: string, data: any) => api.put(`/api/users/${id}`, data),
  delete: (id: string) => api.delete(`/api/users/${id}`),
};

export const eventsApi = {
  // ...
  getAll: () => api.get('/api/events'),
  getById: (id: string) => api.get(`/api/events/${id}`),
  create: (data: any) => api.post('/api/events', data),
  update: (id: string, data: any) => api.put(`/api/events/${id}`, data),
  delete: (id: string) => api.delete(`/api/events/${id}`),
  syncMotorcycles: (id: string, motorcycleIds: string[]) =>
    api.post(`/api/events/${id}/motorcycles`, { motorcycleIds }),
};

export const sessionsApi = {
  getByEvent: (eventId: string) => api.get('/api/sessions', { params: { eventId } }),
  create: (data: any) => api.post('/api/sessions', data),
  update: (id: string, data: any) => api.put(`/api/sessions/${id}`, data),
};

export const bookingsApi = {
  getAll: (params?: any) => api.get('/api/bookings', { params }),
  getById: (id: string) => api.get(`/api/bookings/${id}`),
  getByEvent: (eventId: string) => api.get(`/api/bookings/event/${eventId}`),
  update: (id: string, data: any) => api.put(`/api/bookings/${id}`, data),
  updateUser: (id: string, data: any) => api.put(`/api/bookings/${id}/user`, data),
  delete: (id: string) => api.delete(`/api/bookings/${id}`),
  exportLeads: (eventId: string) =>
    api.get(`/api/bookings/export/leads/${eventId}`, { responseType: 'blob' }),
  exportSatisfaction: (eventId: string) =>
    api.get(`/api/bookings/export/satisfaction/${eventId}`, { responseType: 'blob' }),
};

export const motorcyclesApi = {
  getAll: () => api.get('/api/motorcycles'),
  getById: (id: string) => api.get(`/api/motorcycles/${id}`),
  create: (data: any) => api.post('/api/motorcycles', data),
  update: (id: string, data: any) => api.put(`/api/motorcycles/${id}`, data),
  delete: (id: string) => api.delete(`/api/motorcycles/${id}`),
};

export const dealersApi = {
  getAll: () => api.get('/api/dealers'),
  getById: (id: string) => api.get(`/api/dealers/${id}`),
  create: (data: any) => api.post('/api/dealers', data),
  update: (id: string, data: any) => api.put(`/api/dealers/${id}`, data),
  delete: (id: string) => api.delete(`/api/dealers/${id}`),
};

export const statsApi = {
  getDashboard: () => api.get('/api/stats/dashboard'),
  getWebsite: () => api.get('/api/stats/website'),
  getEmailing: () => api.get('/api/stats/emailing'),
};

export const formsApi = {
  // Client Satisfaction Forms
  getClientSatisfactionForms: (params?: any) =>
    api.get('/api/forms/client-satisfaction', { params }),
  getClientSatisfaction: (bookingId: string) =>
    api.get(`/api/forms/client-satisfaction/${bookingId}`),
  submitClientSatisfaction: (bookingId: string, data: any) =>
    api.post(`/api/forms/client-satisfaction/${bookingId}`, data),

  // Dealer Satisfaction Forms
  getDealerSatisfactionForms: (params?: any) =>
    api.get('/api/forms/dealer-satisfaction', { params }),
  getDealerSatisfaction: (eventId: string) =>
    api.get(`/api/forms/dealer-satisfaction/${eventId}`),
  submitDealerSatisfaction: (eventId: string, data: any) =>
    api.post(`/api/forms/dealer-satisfaction/${eventId}`, data),
  sendDealerFormReminder: (eventId: string) =>
    api.post(`/api/forms/dealer-satisfaction/${eventId}/reminder`),

  // DRT Team Reports
  getDRTTeamReports: (params?: any) =>
    api.get('/api/forms/team-report', { params }),
  getTeamReport: (eventId: string) =>
    api.get(`/api/forms/team-report/${eventId}`),
  submitTeamReport: (eventId: string, data: any) =>
    api.post(`/api/forms/team-report/${eventId}`, data),
  getDRTTeamYearlyReport: () =>
    api.get('/api/forms/team-report/yearly-ranking'),
};

export const emailingApi = {
  getTemplates: () => api.get('/api/emailing/templates'),
  updateTemplate: (id: string, data: any) =>
    api.put(`/api/emailing/templates/${id}`, data),
  sendCustomEmail: (data: any) => api.post('/api/emailing/send', data),
};

export const emailsApi = {
  send: (data: { to: string | string[]; subject: string; message: string }) =>
    api.post('/api/emails/send', data),
  sendBulk: (data: { recipients: string[]; subject: string; message: string }) =>
    api.post('/api/emails/bulk', data),
  sendBookingConfirmation: (bookingId: string) =>
    api.post(`/api/emails/booking-confirmation/${bookingId}`),
  sendBookingReminder: (bookingId: string) =>
    api.post(`/api/emails/booking-reminder/${bookingId}`),
  verifyConnection: () => api.get('/api/emails/verify'),
};

export const uploadApi = {
  uploadMotorcycleImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/api/upload/motorcycle', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
