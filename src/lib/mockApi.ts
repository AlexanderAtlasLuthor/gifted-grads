import type {
  Attendee,
  AttendeeListResponse,
  CategoryCount,
  CurrentRaffleResponse,
  GeneroBreakdown,
  Genero,
  LoginResponse,
  Metrics,
  NivelAcademico,
  RaffleDrawRequest,
  RaffleDrawResponse,
  RegisterRequest,
  RegisterResponse,
  RegistrationLookup,
} from '@shared/types';
import { ApiError } from './api';

const MOCK_PASSWORD = 'admin';
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000;

const generos: Genero[] = ['M', 'F', 'OTRO', 'PREFIERO_NO_DECIR'];
const niveles: NivelAcademico[] = [
  'SECUNDARIA',
  'PREGRADO',
  'POSGRADO',
  'OTRO',
];
const institucionesSeed = [
  'Universidad Nacional',
  'Tecnológico de Monterrey',
  'PUCP',
  'Universidad de los Andes',
  'UNAM',
];
const carrerasSeed = [
  'Ingeniería de Sistemas',
  'Diseño Gráfico',
  'Administración',
  'Medicina',
  'Derecho',
  'Psicología',
];
const nombresSeed = [
  'Ana López',
  'Carlos Pérez',
  'María García',
  'Juan Rodríguez',
  'Lucía Fernández',
  'Pedro Sánchez',
  'Sofía Ramírez',
  'Diego Torres',
  'Valeria Castro',
  'Andrés Morales',
  'Camila Vargas',
  'Mateo Herrera',
  'Isabella Ruiz',
  'Sebastián Mendoza',
  'Daniela Rojas',
  'Felipe Silva',
  'Gabriela Cruz',
  'Nicolás Ortiz',
  'Paula Jiménez',
  'Tomás Aguirre',
];

let attendees: Attendee[] = [];
let nextNumber = 1;
let currentWinner: CurrentRaffleResponse | null = null;
let activeToken: { token: string; expiresAt: string } | null = null;

function seed() {
  if (attendees.length > 0) return;
  const now = Date.now();
  nombresSeed.forEach((nombre, i) => {
    const [first] = nombre.toLowerCase().split(' ');
    attendees.push({
      id: crypto.randomUUID(),
      participantNumber: nextNumber++,
      nombre,
      email: `${first}${i}@example.com`,
      telefono: `+1 555 000 ${(1000 + i).toString().slice(-4)}`,
      genero: generos[i % generos.length],
      edad: 18 + (i % 25),
      institucion: institucionesSeed[i % institucionesSeed.length],
      carrera: carrerasSeed[i % carrerasSeed.length],
      nivelAcademico: niveles[i % niveles.length],
      createdAt: new Date(now - (nombresSeed.length - i) * 60_000).toISOString(),
    });
  });
}

function delay<T>(value: T, ms = 150): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function computeMetrics(): Metrics {
  const total = attendees.length;
  const byGenero: GeneroBreakdown = {
    M: 0,
    F: 0,
    OTRO: 0,
    PREFIERO_NO_DECIR: 0,
  };
  for (const a of attendees) byGenero[a.genero]++;
  const generoPercent: GeneroBreakdown = {
    M: total ? (byGenero.M / total) * 100 : 0,
    F: total ? (byGenero.F / total) * 100 : 0,
    OTRO: total ? (byGenero.OTRO / total) * 100 : 0,
    PREFIERO_NO_DECIR: total ? (byGenero.PREFIERO_NO_DECIR / total) * 100 : 0,
  };
  const tallyBy = (key: keyof Attendee): CategoryCount[] => {
    const counts = new Map<string, number>();
    for (const a of attendees) {
      const v = String(a[key]);
      counts.set(v, (counts.get(v) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([k, count]) => ({
        key: k,
        count,
        percent: total ? (count / total) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };
  const promedioEdad =
    total > 0
      ? Math.round(
          (attendees.reduce((acc, a) => acc + a.edad, 0) / total) * 10,
        ) / 10
      : 0;
  return {
    total,
    byGenero,
    generoPercent,
    byCarrera: tallyBy('carrera'),
    byInstitucion: tallyBy('institucion'),
    byNivel: tallyBy('nivelAcademico'),
    promedioEdad,
    updatedAt: new Date().toISOString(),
  };
}

function requireAuth() {
  if (!activeToken || new Date(activeToken.expiresAt).getTime() < Date.now()) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Sesión expirada o no iniciada');
  }
}

export const mockApi = {
  async register(body: RegisterRequest): Promise<RegisterResponse> {
    seed();
    const emailLower = body.email.toLowerCase();
    if (attendees.some((a) => a.email.toLowerCase() === emailLower)) {
      throw new ApiError(409, 'EMAIL_EXISTS', 'Email ya registrado');
    }
    const attendee: Attendee = {
      id: crypto.randomUUID(),
      participantNumber: nextNumber++,
      nombre: body.nombre,
      email: emailLower,
      telefono: body.telefono,
      genero: body.genero,
      edad: body.edad,
      institucion: body.institucion,
      carrera: body.carrera,
      nivelAcademico: body.nivelAcademico,
      createdAt: new Date().toISOString(),
    };
    attendees.push(attendee);
    return delay({
      id: attendee.id,
      participantNumber: attendee.participantNumber,
      createdAt: attendee.createdAt,
    });
  },

  async login(password: string): Promise<LoginResponse> {
    if (password !== MOCK_PASSWORD) {
      throw new ApiError(401, 'INVALID_PASSWORD', 'Contraseña incorrecta');
    }
    activeToken = {
      token: crypto.randomUUID(),
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS).toISOString(),
    };
    return delay({ ...activeToken });
  },

  async me() {
    requireAuth();
    return delay({ ok: true as const });
  },

  async listAttendees(params: {
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<AttendeeListResponse> {
    requireAuth();
    seed();
    const page = Math.max(1, params.page ?? 1);
    const pageSize = Math.min(200, Math.max(1, params.pageSize ?? 25));
    const search = (params.search ?? '').trim().toLowerCase();
    const filtered = search
      ? attendees.filter(
          (a) =>
            a.nombre.toLowerCase().includes(search) ||
            a.email.toLowerCase().includes(search) ||
            String(a.participantNumber).includes(search) ||
            String(a.participantNumber).padStart(3, '0').includes(search),
        )
      : attendees;
    const sorted = [...filtered].sort(
      (a, b) => b.participantNumber - a.participantNumber,
    );
    const start = (page - 1) * pageSize;
    return delay({
      items: sorted.slice(start, start + pageSize),
      total: sorted.length,
      page,
      pageSize,
    });
  },

  async getAttendee(id: string): Promise<Attendee> {
    requireAuth();
    const found = attendees.find((a) => a.id === id);
    if (!found) throw new ApiError(404, 'NOT_FOUND', 'Asistente no encontrado');
    return delay(found);
  },

  async metrics(): Promise<Metrics> {
    requireAuth();
    seed();
    return delay(computeMetrics());
  },

  async drawRaffle(body: RaffleDrawRequest): Promise<RaffleDrawResponse> {
    requireAuth();
    if (attendees.length === 0) {
      throw new ApiError(400, 'NO_ATTENDEES', 'No hay asistentes registrados');
    }
    let winner: Attendee;
    if (body.mode === 'manual') {
      const found = attendees.find(
        (a) => a.participantNumber === body.participantNumber,
      );
      if (!found) {
        throw new ApiError(
          404,
          'WINNER_NOT_FOUND',
          'Número de participante no encontrado',
        );
      }
      winner = found;
    } else {
      winner = attendees[Math.floor(Math.random() * attendees.length)];
    }
    const drawnAt = new Date().toISOString();
    currentWinner = { winner, drawnAt };
    return delay({ winner, drawnAt, emailSent: true });
  },

  async currentRaffle(): Promise<CurrentRaffleResponse | null> {
    requireAuth();
    return delay(currentWinner);
  },

  async getRegistrationBySubmission(id: string): Promise<RegistrationLookup> {
    // Mock mode doesn't have Jotform — fall back to "newest attendee" so
    // /confirmacion?submission=anything resolves to something for testing.
    seed();
    const found = attendees[attendees.length - 1];
    if (!found) {
      throw new ApiError(404, 'PENDING', 'Registration not yet processed');
    }
    void id;
    return delay({ participantNumber: found.participantNumber, attendee: found });
  },
};
