// ============================================================================
// Types d'utilisateurs et authentification
// ============================================================================

export enum UserRole {
  ADMIN = 'ADMIN', // Héloïse + équipe DRT centrale
  DEALER = 'DEALER', // Concessionnaires
  INSTRUCTOR = 'INSTRUCTOR', // Instructeurs moto
  CLIENT = 'CLIENT', // Clients/essayeurs
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Types de permis de conduire
// ============================================================================

export enum LicenseType {
  A = 'A', // Permis A (toutes motos)
  A2 = 'A2', // Permis A2 (motos bridées)
  A1 = 'A1', // Permis A1 (125cc)
}

export interface DriverLicense {
  type: LicenseType;
  number: string;
  issueDate: Date;
  expiryDate: Date;
  frontPhotoUrl?: string;
  backPhotoUrl?: string;
}

// ============================================================================
// Modèles de motos
// ============================================================================

export enum MotorcycleGroup {
  GROUP_1 = 'GROUP_1', // Groupe 1: petites cylindrées et A2
  GROUP_2 = 'GROUP_2', // Groupe 2: grosses cylindrées (permis A)
}

export enum MotorcycleStatus {
  AVAILABLE = 'AVAILABLE',
  IN_USE = 'IN_USE',
  DAMAGED = 'DAMAGED',
  UNDER_REPAIR = 'UNDER_REPAIR',
}

export interface Motorcycle {
  id: string;
  model: string;
  plateNumber: string;
  bikeNumber: number; // Numéro apposé sur la moto (sticker)
  group: MotorcycleGroup;
  status: MotorcycleStatus;
  imageUrl: string;
  requiredLicense: LicenseType;
  isYAMT: boolean; // Modèle Y-AMT
  createdAt: Date;
  updatedAt: Date;
}

export interface MotorcycleDamage {
  id: string;
  motorcycleId: string;
  reportedAt: Date;
  reportedBy: string;
  description: string;
  estimatedRepairDate?: Date;
  repairedAt?: Date;
}

// ============================================================================
// Événements et sessions
// ============================================================================

export enum EventType {
  DEALERSHIP = 'DEALERSHIP', // En concession
  PUBLIC_EVENT = 'PUBLIC_EVENT', // Événement public
}

export interface Event {
  id: string;
  name: string;
  type: EventType;
  dealerId?: string;
  startDate: Date;
  endDate: Date;
  address: string;
  city: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  maxSlotsPerSession: number; // Max 7 clients par session
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  eventId: string;
  group: MotorcycleGroup;
  startTime: Date;
  endTime: Date;
  availableSlots: number;
  bookedSlots: number;
  instructorId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Réservations
// ============================================================================

export enum BookingStatus {
  RESERVED = 'RESERVED', // Réservé en ligne
  CONFIRMED = 'CONFIRMED', // Présence confirmée sur place
  IN_PROGRESS = 'IN_PROGRESS', // Essai en cours
  COMPLETED = 'COMPLETED', // Essai terminé
  CANCELLED = 'CANCELLED', // Annulé
  NO_SHOW = 'NO_SHOW', // Non présenté
}

export enum BookingSource {
  WEBSITE = 'WEBSITE',
  TABLET = 'TABLET',
  DEALER_SITE = 'DEALER_SITE',
}

export interface Booking {
  id: string;
  userId: string;
  eventId: string;
  sessionId: string;
  motorcycleId: string;
  status: BookingStatus;
  source: BookingSource;
  hasSignedWaiver: boolean;
  hasPhotoConsent: boolean;
  licensePhotoFrontUrl?: string;
  licensePhotoBackUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  cancelledAt?: Date;
}

// ============================================================================
// Formulaires de satisfaction
// ============================================================================

export interface ClientSatisfactionForm {
  id: string;
  bookingId: string;
  userId: string;
  eventId: string;

  // Satisfaction générale
  overallRating: number; // 1-5
  motorcycleRating: number; // 1-5
  instructorRating: number; // 1-5
  organizationRating: number; // 1-5;

  // Intention d'achat
  purchaseIntent: 'YES' | 'MAYBE' | 'NO';
  purchaseTimeframe?: '0-3_MONTHS' | '3-6_MONTHS' | '6-12_MONTHS' | 'LATER';

  // Moto actuelle
  currentBrand?: string;
  currentModel?: string;

  // Commentaires
  comments?: string;

  createdAt: Date;
}

export interface DealerSatisfactionForm {
  id: string;
  eventId: string;
  dealerId: string;

  // Satisfaction
  organizationRating: number; // 1-5
  teamRating: number; // 1-5

  // Auto-déclaration
  animationsDescription: string;
  promotionsOffered: string;
  salesCount: number;

  // Engagement futur
  wouldParticipateAgain: boolean;

  createdAt: Date;
}

export enum DRTCriteria {
  LEAD_TREATMENT = 'LEAD_TREATMENT',
  ANIMATION = 'ANIMATION',
  TEAM_ENGAGEMENT = 'TEAM_ENGAGEMENT',
  COMMUNICATION = 'COMMUNICATION',
  CLIENT_SATISFACTION = 'CLIENT_SATISFACTION',
}

export interface DRTTeamReport {
  id: string;
  eventId: string;
  reportedBy: string;

  // Notation des critères (sur 5 ou 10 points selon barème)
  leadTreatmentScore: number;
  animationScore: number;
  teamEngagementScore: number;
  communicationScore: number;
  clientSatisfactionScore: number;

  // Photos et observations
  photoUrls: string[];
  dealerInvestmentNotes: string;
  animationNotes: string;
  salesNotes: string;

  createdAt: Date;
}

// ============================================================================
// Statistiques et exports
// ============================================================================

export interface EventStats {
  eventId: string;
  totalSlots: number;
  bookedSlots: number;
  completedRides: number;
  cancelledBookings: number;
  noShows: number;
  bookingRate: number; // Pourcentage
  conversionRate: number; // Leads vers ventes
}

export interface LeadExport {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  postalCode: string;
  motorcycleModel: string;
  purchaseIntent: string;
  eventDate: string;
  dealerName: string;
}

// ============================================================================
// Types API
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================================
// Types de notification
// ============================================================================

export enum NotificationType {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
}

export enum EmailTemplate {
  BOOKING_CONFIRMATION = 'BOOKING_CONFIRMATION',
  BOOKING_REMINDER = 'BOOKING_REMINDER',
  BOOKING_MODIFIED = 'BOOKING_MODIFIED',
  BOOKING_CANCELLED = 'BOOKING_CANCELLED',
  MOTORCYCLE_UNAVAILABLE = 'MOTORCYCLE_UNAVAILABLE',
  DEALER_SATISFACTION_REQUEST = 'DEALER_SATISFACTION_REQUEST',
}

export interface EmailData {
  to: string;
  template: EmailTemplate;
  data: Record<string, any>;
}
