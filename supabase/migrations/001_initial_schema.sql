-- ============================================================
-- Migration: Initial Schema untuk Supabase
-- Jalankan ini di: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Tabel: User
CREATE TABLE IF NOT EXISTS "User" (
  "id"        TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "email"     TEXT        NOT NULL,
  "name"      TEXT,
  "password"  TEXT        NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

-- Tabel: Post
CREATE TABLE IF NOT EXISTS "Post" (
  "id"        TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "title"     TEXT        NOT NULL,
  "content"   TEXT,
  "published" BOOLEAN     NOT NULL DEFAULT false,
  "authorId"  TEXT        NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- Tabel: Maskapai
CREATE TABLE IF NOT EXISTS "Maskapai" (
  "id"        TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "kode"      TEXT        NOT NULL,
  "nama"      TEXT        NOT NULL,
  "kontak"    TEXT,
  "email"     TEXT,
  "status"    TEXT        NOT NULL DEFAULT 'active',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT "Maskapai_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Maskapai_kode_key" ON "Maskapai"("kode");

-- Tabel: Flight
CREATE TABLE IF NOT EXISTS "Flight" (
  "id"                   TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "tanggal"              TEXT        NOT NULL,
  "operator"             TEXT        NOT NULL,
  "transit"              TEXT,
  "kapasitasKursi"       INTEGER,

  -- Datang
  "datangAsal"           TEXT        NOT NULL,
  "datangTujuan"         TEXT        NOT NULL,
  "datangFlightNumber"   TEXT        NOT NULL,
  "datangDewasa"         TEXT,
  "datangAnak"           TEXT,
  "datangBayi"           TEXT,
  "datangBagasi"         TEXT,
  "datangCargo"          TEXT,
  "datangPergerakan"     TEXT,

  -- Berangkat
  "berangkatAsal"        TEXT        NOT NULL,
  "berangkatTujuan"      TEXT        NOT NULL,
  "berangkatFlightNumber" TEXT       NOT NULL,
  "berangkatDewasa"      TEXT,
  "berangkatAnak"        TEXT,
  "berangkatBayi"        TEXT,
  "berangkatBagasi"      TEXT,
  "berangkatCargo"       TEXT,
  "berangkatPergerakan"  TEXT,

  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT "Flight_pkey" PRIMARY KEY ("id")
);

-- ============================================================
-- Trigger: auto-update "updatedAt" saat row diupdate
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER "User_updatedAt"
  BEFORE UPDATE ON "User"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER "Post_updatedAt"
  BEFORE UPDATE ON "Post"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER "Maskapai_updatedAt"
  BEFORE UPDATE ON "Maskapai"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER "Flight_updatedAt"
  BEFORE UPDATE ON "Flight"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Seed: User admin awal
-- Ganti hash password jika perlu (ini adalah bcrypt hash dari "password123")
-- ============================================================
INSERT INTO "User" ("id", "email", "name", "password")
VALUES (
  gen_random_uuid()::text,
  'admin@example.com',
  'Admin User',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'  -- password: password
)
ON CONFLICT ("email") DO NOTHING;
