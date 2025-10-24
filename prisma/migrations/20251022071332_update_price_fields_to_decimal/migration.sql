/*
  Warnings:

  - You are about to drop the column `email` on the `users` table. All the data in the column will be lost.
  - You are about to alter the column `walletAddress` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(42)`.
  - You are about to drop the `campaigns` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `contributions` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."DRSeriesStatus" AS ENUM ('UPCOMING', 'LIVE', 'SUCCESS', 'FAILED', 'ENDED');

-- CreateEnum
CREATE TYPE "public"."DRTokenStatus" AS ENUM ('ACTIVE', 'REFUNDED', 'BURNED');

-- CreateEnum
CREATE TYPE "public"."ListingStatus" AS ENUM ('ACTIVE', 'SOLD', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "public"."campaigns" DROP CONSTRAINT "campaigns_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."contributions" DROP CONSTRAINT "contributions_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "public"."contributions" DROP CONSTRAINT "contributions_userId_fkey";

-- DropIndex
DROP INDEX "public"."users_email_key";

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "email",
ADD COLUMN     "fid" BIGINT,
ALTER COLUMN "walletAddress" SET DATA TYPE VARCHAR(42);

-- DropTable
DROP TABLE "public"."campaigns";

-- DropTable
DROP TABLE "public"."contributions";

-- DropEnum
DROP TYPE "public"."CampaignStatus";

-- CreateTable
CREATE TABLE "public"."dr_series" (
    "id" TEXT NOT NULL,
    "contractAddress" VARCHAR(42) NOT NULL,
    "creatorAddress" VARCHAR(42) NOT NULL,
    "paymentToken" VARCHAR(42) NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "maxItems" INTEGER NOT NULL,
    "presaleTimestamp" TIMESTAMP(3) NOT NULL,
    "startPrice" DECIMAL(65,30) NOT NULL,
    "priceIncrement" DECIMAL(65,30) NOT NULL,
    "minRequiredSales" INTEGER NOT NULL,
    "totalEverMinted" INTEGER NOT NULL DEFAULT 0,
    "status" "public"."DRSeriesStatus" NOT NULL DEFAULT 'UPCOMING',
    "createdBlock" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dr_series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."dr_tokens" (
    "id" TEXT NOT NULL,
    "drAddress" VARCHAR(42) NOT NULL,
    "tokenId" BIGINT NOT NULL,
    "mintPriceWei" BIGINT NOT NULL,
    "mintPriceNetWei" BIGINT NOT NULL,
    "paymentToken" VARCHAR(42) NOT NULL,
    "mintedByAddress" VARCHAR(42) NOT NULL,
    "currentOwner" VARCHAR(42) NOT NULL,
    "status" "public"."DRTokenStatus" NOT NULL DEFAULT 'ACTIVE',
    "mintedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mintedBlock" BIGINT,
    "seriesId" TEXT NOT NULL,

    CONSTRAINT "dr_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."listings" (
    "id" TEXT NOT NULL,
    "drAddress" VARCHAR(42) NOT NULL,
    "tokenId" BIGINT NOT NULL,
    "priceWei" BIGINT NOT NULL,
    "paymentToken" VARCHAR(42) NOT NULL,
    "sellerAddress" VARCHAR(42) NOT NULL,
    "buyerAddress" VARCHAR(42),
    "status" "public"."ListingStatus" NOT NULL DEFAULT 'ACTIVE',
    "listedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "boughtAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "listedBlock" BIGINT,
    "boughtBlock" BIGINT,
    "cancelledBlock" BIGINT,
    "seriesId" TEXT,
    "tokenRefId" TEXT,

    CONSTRAINT "listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."creator_withdrawals" (
    "id" TEXT NOT NULL,
    "drAddress" VARCHAR(42) NOT NULL,
    "creatorAddress" VARCHAR(42) NOT NULL,
    "amountWei" BIGINT NOT NULL,
    "txHash" TEXT NOT NULL,
    "blockNumber" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "seriesId" TEXT,

    CONSTRAINT "creator_withdrawals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dr_series_contractAddress_key" ON "public"."dr_series"("contractAddress");

-- CreateIndex
CREATE INDEX "dr_series_creatorAddress_idx" ON "public"."dr_series"("creatorAddress");

-- CreateIndex
CREATE INDEX "dr_series_paymentToken_idx" ON "public"."dr_series"("paymentToken");

-- CreateIndex
CREATE INDEX "dr_tokens_currentOwner_idx" ON "public"."dr_tokens"("currentOwner");

-- CreateIndex
CREATE INDEX "dr_tokens_drAddress_tokenId_idx" ON "public"."dr_tokens"("drAddress", "tokenId");

-- CreateIndex
CREATE UNIQUE INDEX "dr_tokens_drAddress_tokenId_key" ON "public"."dr_tokens"("drAddress", "tokenId");

-- CreateIndex
CREATE INDEX "listings_drAddress_tokenId_idx" ON "public"."listings"("drAddress", "tokenId");

-- CreateIndex
CREATE INDEX "listings_status_idx" ON "public"."listings"("status");

-- CreateIndex
CREATE UNIQUE INDEX "creator_withdrawals_txHash_key" ON "public"."creator_withdrawals"("txHash");

-- CreateIndex
CREATE INDEX "creator_withdrawals_drAddress_idx" ON "public"."creator_withdrawals"("drAddress");

-- CreateIndex
CREATE INDEX "creator_withdrawals_creatorAddress_idx" ON "public"."creator_withdrawals"("creatorAddress");

-- CreateIndex
CREATE INDEX "users_walletAddress_idx" ON "public"."users"("walletAddress");

-- AddForeignKey
ALTER TABLE "public"."dr_tokens" ADD CONSTRAINT "dr_tokens_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "public"."dr_series"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."listings" ADD CONSTRAINT "listings_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "public"."dr_series"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."listings" ADD CONSTRAINT "listings_tokenRefId_fkey" FOREIGN KEY ("tokenRefId") REFERENCES "public"."dr_tokens"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."creator_withdrawals" ADD CONSTRAINT "creator_withdrawals_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "public"."dr_series"("id") ON DELETE SET NULL ON UPDATE CASCADE;
