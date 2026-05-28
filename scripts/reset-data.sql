-- Wipe all live data without touching the schema.
-- Use this to clear test submissions and the test raffle winner before
-- the real event goes live. Keeps the tables, indexes, and the
-- migration tracking intact.

-- Order matters: raffle_draws has a FK reference to attendees.
DELETE FROM raffle_draws;
DELETE FROM attendees;

-- Optional: clear manager login sessions so any open dashboard tabs
-- have to re-authenticate. Skip the WHERE to keep current sessions.
DELETE FROM manager_sessions;

-- Reset AUTOINCREMENT counters so raffle_draws.id restarts at 1.
DELETE FROM sqlite_sequence WHERE name IN ('raffle_draws');
