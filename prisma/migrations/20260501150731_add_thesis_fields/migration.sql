-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'DOCTOR');

-- CreateEnum
CREATE TYPE "ThesisType" AS ENUM ('MASTER', 'PHD');

-- CreateEnum
CREATE TYPE "ThesisStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'APPROVED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'DOCTOR',
    "academicTitle" TEXT NOT NULL DEFAULT 'دكتور',
    "doctorCode" TEXT,
    "password" TEXT NOT NULL,
    "tempPassword" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "image" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacultyDoctor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "academicTitle" TEXT NOT NULL DEFAULT 'دكتور',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FacultyDoctor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalExaminer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "universityName" TEXT NOT NULL,
    "academicTitle" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,

    CONSTRAINT "ExternalExaminer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Thesis" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "type" "ThesisType" NOT NULL,
    "status" "ThesisStatus" NOT NULL DEFAULT 'PENDING',
    "registrationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "defenseDate" TIMESTAMP(3),
    "department" TEXT,
    "notes" TEXT,
    "researchType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Thesis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Promotion" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "oldTitle" TEXT NOT NULL,
    "newTitle" TEXT NOT NULL,
    "promotionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'info',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supervision" (
    "id" TEXT NOT NULL,
    "thesisId" TEXT NOT NULL,
    "doctorId" TEXT,
    "externalExaminerId" TEXT,
    "supervisionRole" TEXT NOT NULL,

    CONSTRAINT "Supervision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_doctorCode_key" ON "User"("doctorCode");

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "FacultyDoctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supervision" ADD CONSTRAINT "Supervision_thesisId_fkey" FOREIGN KEY ("thesisId") REFERENCES "Thesis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supervision" ADD CONSTRAINT "Supervision_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "FacultyDoctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supervision" ADD CONSTRAINT "Supervision_externalExaminerId_fkey" FOREIGN KEY ("externalExaminerId") REFERENCES "ExternalExaminer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
