export const queryKeys = {
  me: ['me'] as const,
  attendees: (search: string, page: number, pageSize: number) =>
    ['attendees', { search, page, pageSize }] as const,
  attendeesAll: ['attendees'] as const,
  attendee: (id: string) => ['attendee', id] as const,
  metrics: ['metrics'] as const,
  raffleCurrent: ['raffle', 'current'] as const,
  donationSummary: ['donations', 'summary'] as const,
  donationBySession: (id: string) => ['donations', 'session', id] as const,
};

export const POLL_INTERVAL_MS = 4000;
