/*
  Warnings:

  - Added the required column `total_tracked_crns` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "total_tracked_crns" INTEGER NOT NULL;
