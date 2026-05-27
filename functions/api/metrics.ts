import { json } from '../_shared/responses';
import type { CategoryCount, GeneroBreakdown, Metrics } from '@shared/types';

type Env = { DB: D1Database };

interface AggRow {
  key: string;
  count: number;
}

function emptyGenero(): GeneroBreakdown {
  return { M: 0, F: 0, OTRO: 0, PREFIERO_NO_DECIR: 0 };
}

function toCategories(rows: AggRow[], total: number, limit: number): CategoryCount[] {
  return rows.slice(0, limit).map((r) => ({
    key: r.key,
    count: r.count,
    percent: total > 0 ? (r.count / total) * 100 : 0,
  }));
}

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const totalRow = await ctx.env.DB.prepare(
    'SELECT COUNT(*) AS total, COALESCE(AVG(edad), 0) AS avg_edad FROM attendees',
  ).first<{ total: number; avg_edad: number }>();
  const total = totalRow?.total ?? 0;
  const promedioEdad = total > 0 ? Math.round((totalRow?.avg_edad ?? 0) * 10) / 10 : 0;

  const generoRows = await ctx.env.DB.prepare(
    'SELECT genero AS key, COUNT(*) AS count FROM attendees GROUP BY genero',
  ).all<AggRow>();

  const byGenero = emptyGenero();
  for (const row of generoRows.results ?? []) {
    if (row.key in byGenero) {
      byGenero[row.key as keyof GeneroBreakdown] = row.count;
    }
  }
  const generoPercent = emptyGenero();
  if (total > 0) {
    (Object.keys(byGenero) as Array<keyof GeneroBreakdown>).forEach((k) => {
      generoPercent[k] = (byGenero[k] / total) * 100;
    });
  }

  const carreraRows = await ctx.env.DB.prepare(
    'SELECT carrera AS key, COUNT(*) AS count FROM attendees GROUP BY carrera ORDER BY count DESC LIMIT 10',
  ).all<AggRow>();
  const institucionRows = await ctx.env.DB.prepare(
    'SELECT institucion AS key, COUNT(*) AS count FROM attendees GROUP BY institucion ORDER BY count DESC LIMIT 10',
  ).all<AggRow>();
  const nivelRows = await ctx.env.DB.prepare(
    'SELECT nivel_academico AS key, COUNT(*) AS count FROM attendees GROUP BY nivel_academico ORDER BY count DESC',
  ).all<AggRow>();

  const response: Metrics = {
    total,
    byGenero,
    generoPercent,
    byCarrera: toCategories(carreraRows.results ?? [], total, 10),
    byInstitucion: toCategories(institucionRows.results ?? [], total, 10),
    byNivel: toCategories(nivelRows.results ?? [], total, 10),
    promedioEdad,
    updatedAt: new Date().toISOString(),
  };
  return json(200, response);
};
