import { loginSchema } from '@shared/schemas';
import { error, json } from '../../_shared/responses';
import { TOKEN_TTL_MS, timingSafeEqual } from '../../_shared/auth';
import { sqliteToIso } from '../../_shared/db';

type Env = {
  DB: D1Database;
  MANAGER_PASSWORD: string;
};

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const raw = await ctx.request.json().catch(() => null);
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return error(400, 'VALIDATION_ERROR', 'Invalid body');
  }
  if (!ctx.env.MANAGER_PASSWORD) {
    return error(500, 'SERVER_ERROR', 'Manager password not configured');
  }
  if (!timingSafeEqual(parsed.data.password, ctx.env.MANAGER_PASSWORD)) {
    return error(401, 'INVALID_PASSWORD', 'Contraseña incorrecta');
  }

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS).toISOString();

  await ctx.env.DB.prepare(
    'INSERT INTO manager_sessions (token, expires_at) VALUES (?, ?)',
  )
    .bind(token, expiresAt)
    .run();

  // Best-effort cleanup of expired sessions (no error if it fails).
  ctx.waitUntil(
    ctx.env.DB.prepare(
      "DELETE FROM manager_sessions WHERE expires_at < datetime('now')",
    )
      .run()
      .catch(() => {}),
  );

  return json(200, { token, expiresAt: sqliteToIso(expiresAt) });
};
