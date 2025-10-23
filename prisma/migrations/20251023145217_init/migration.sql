/*
  Warnings:

  - You are about to drop the column `faceEmbedding` on the `Staff` table. All the data in the column will be lost.
  - You are about to drop the column `faceImage` on the `Staff` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Staff" DROP COLUMN "faceEmbedding",
DROP COLUMN "faceImage",
ADD COLUMN     "faceDescriptor" JSONB;
