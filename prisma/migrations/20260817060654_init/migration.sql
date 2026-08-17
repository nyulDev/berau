-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Maskapai" (
    "id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kontak" TEXT,
    "email" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Maskapai_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Flight" (
    "id" TEXT NOT NULL,
    "tanggal" TEXT NOT NULL,
    "operator" TEXT NOT NULL,
    "transit" TEXT,
    "kapasitasKursi" INTEGER,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Flight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Maskapai_kode_key" ON "Maskapai"("kode");
