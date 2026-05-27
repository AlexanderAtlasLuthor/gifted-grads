export type Genero = 'M' | 'F' | 'OTRO' | 'PREFIERO_NO_DECIR';

export type NivelAcademico = 'SECUNDARIA' | 'PREGRADO' | 'POSGRADO' | 'OTRO';

export interface RegisterRequest {
  nombre: string;
  email: string;
  telefono: string;
  genero: Genero;
  edad: number;
  institucion: string;
  carrera: string;
  nivelAcademico: NivelAcademico;
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
  genero: Genero;
  edad: number;
  institucion: string;
  carrera: string;
  nivelAcademico: NivelAcademico;
  createdAt: string;
}

export interface AttendeeListResponse {
  items: Attendee[];
  total: number;
  page: number;
  pageSize: number;
}

export interface GeneroBreakdown {
  M: number;
  F: number;
  OTRO: number;
  PREFIERO_NO_DECIR: number;
}

export interface CategoryCount {
  key: string;
  count: number;
  percent: number;
}

export interface Metrics {
  total: number;
  byGenero: GeneroBreakdown;
  generoPercent: GeneroBreakdown;
  byCarrera: CategoryCount[];
  byInstitucion: CategoryCount[];
  byNivel: CategoryCount[];
  promedioEdad: number;
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

export interface RegistrationLookup {
  participantNumber: number;
  attendee: Attendee;
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
  | 'PENDING'
  | 'SERVER_ERROR';

export interface ApiErrorBody {
  error: {
    code: ApiErrorCode;
    message: string;
    fields?: Record<string, string>;
  };
}
