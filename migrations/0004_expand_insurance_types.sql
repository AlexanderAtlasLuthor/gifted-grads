-- Expand supported insurance types.
-- Rebuild attendees because SQLite/D1 cannot alter CHECK constraints in place.

PRAGMA foreign_keys = OFF;

CREATE TABLE attendees_new (
  id TEXT PRIMARY KEY,
  participant_number INTEGER NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  telefono TEXT NOT NULL,
  insurance_type TEXT NOT NULL CHECK (insurance_type IN ('AUTO','HOME','COMMERCIAL','RENTERS')),
  jotform_submission_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO attendees_new (
  id,
  participant_number,
  nombre,
  email,
  telefono,
  insurance_type,
  jotform_submission_id,
  created_at
)
SELECT
  id,
  participant_number,
  nombre,
  email,
  telefono,
  CASE insurance_type
    WHEN 'HOUSE' THEN 'HOME'
    WHEN 'LIFE' THEN 'AUTO'
    ELSE insurance_type
  END,
  jotform_submission_id,
  created_at
FROM attendees
WHERE insurance_type IN ('HOUSE','AUTO','LIFE','HOME','COMMERCIAL','RENTERS');

DROP TABLE attendees;
ALTER TABLE attendees_new RENAME TO attendees;

CREATE INDEX idx_attendees_email ON attendees(email);
CREATE INDEX idx_attendees_number ON attendees(participant_number);
CREATE INDEX idx_attendees_created ON attendees(created_at);
CREATE INDEX idx_attendees_insurance_type ON attendees(insurance_type);
CREATE UNIQUE INDEX idx_attendees_jotform_submission
  ON attendees(jotform_submission_id)
  WHERE jotform_submission_id IS NOT NULL;

PRAGMA foreign_keys = ON;
