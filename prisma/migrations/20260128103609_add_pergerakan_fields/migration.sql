-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "authorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Maskapai" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kontak" TEXT,
    "email" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Flight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tanggal" TEXT NOT NULL,
    "operator" TEXT NOT NULL,
    "transit" TEXT,
    "datangAsal" TEXT NOT NULL,
    "datangTujuan" TEXT NOT NULL,
    "datangFlightNumber" TEXT NOT NULL,
    "datangDewasa" TEXT,
    "datangAnak" TEXT,
    "datangBayi" TEXT,
    "datangBagasi" TEXT,
    "datangCargo" TEXT,
    "datangPergerakan" TEXT,
    "berangkatAsal" TEXT NOT NULL,
    "berangkatTujuan" TEXT NOT NULL,
    "berangkatFlightNumber" TEXT NOT NULL,
    "berangkatDewasa" TEXT,
    "berangkatAnak" TEXT,
    "berangkatBayi" TEXT,
    "berangkatBagasi" TEXT,
    "berangkatCargo" TEXT,
    "berangkatPergerakan" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Maskapai_kode_key" ON "Maskapai"("kode");
