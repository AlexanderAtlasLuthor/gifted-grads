export type InsuranceType = 'AUTO' | 'HOME' | 'COMMERCIAL' | 'RENTERS';

export interface RegisterRequest {
  nombre: string;
  email: string;
  telefono: string;
  insuranceType: InsuranceType;
}

export interface RegisterResponse {
  id: string;
  participantNumber: number;
  createdAt: string;
}

export interface Attendee {
  id: string;
  participantNumber: number;
  nombre: string;
  email: string;
  telefono: string;
  insuranceType: InsuranceType;
  createdAt: string;
}

export interface AttendeeListResponse {
  items: Attendee[];
  total: number;
  page: number;
  pageSize: number;
}

export interface InsuranceTypeBreakdown {
  AUTO: number;
  HOME: number;
  COMMERCIAL: number;
  RENTERS: number;
}

export interface Metrics {
  total: number;
  leadsToday: number;
  byInsuranceType: InsuranceTypeBreakdown;
  insuranceTypePercent: InsuranceTypeBreakdown;
  updatedAt: string;
}

export interface LoginRequest {
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
}

export type RaffleDrawRequest =
  | { mode: 'random' }
  | { mode: 'manual'; participantNumber: number };

export interface RaffleDrawResponse {
  winner: Attendee;
  drawnAt: string;
  emailSent: boolean;
}

export interface CurrentRaffleResponse {
  winner: Attendee;
  drawnAt: string;
}

export type DonationStatus = 'pending' | 'succeeded' | 'refunded' | 'failed';

export interface Donation {
  id: string;
  amountCents: number;
  currency: string;
  donorName?: string;
  donorEmail?: string;
  message?: string;
  status: DonationStatus;
  createdAt: string;
  succeededAt?: string;
}

export interface DonationCreateRequest {
  amountCents: number;
  donorName?: string;
  donorEmail?: string;
  message?: string;
}

export interface DonationCreateResponse {
  checkoutUrl: string;
  sessionId: string;
}

export interface DonationSummary {
  totalCents: number;
  goalCents: number;
  count: number;
  currency: string;
  recent: Donation[];
  updatedAt: string;
}

export interface DonationLookupResponse {
  amountCents: number;
  currency: string;
  donorName?: string;
  status: DonationStatus;
}

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'EMAIL_EXISTS'
  | 'INVALID_PASSWORD'
  | 'UNAUTHORIZED'
  | 'NOT_FOUND'
  | 'WINNER_NOT_FOUND'
  | 'NO_ATTENDEES'
  | 'RAFFLE_ALREADY_DRAWN'
  | 'RATE_LIMIT'
  | 'STRIPE_ERROR'
  | 'SERVER_ERROR';

export interface ApiErrorBody {
  error: {
    code: ApiErrorCode;
    message: string;
    fields?: Record<string, string>;
  };
}
