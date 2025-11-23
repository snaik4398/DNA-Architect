-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "architectName" TEXT NOT NULL,
    "areaSqFt" DOUBLE PRECISION NOT NULL,
    "location" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "thumbnailBlob" BYTEA NOT NULL,
    "mainImageUrl" TEXT,
    "images" TEXT[],
    "modelUrl" TEXT,
    "youtubeUrl" TEXT,
    "simulationVideoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);
