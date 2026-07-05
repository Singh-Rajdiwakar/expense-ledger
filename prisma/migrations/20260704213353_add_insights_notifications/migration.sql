-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('BUDGET_WARNING', 'BUDGET_EXCEEDED', 'RECURRING_PAYMENT_DUE', 'LARGE_EXPENSE', 'NEGATIVE_BALANCE', 'MONTHLY_REPORT_READY', 'INSIGHT_READY', 'GENERAL');

-- CreateTable
CREATE TABLE "financial_insights" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT,
    "scopeKey" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "totalIncome" DECIMAL(65,30),
    "totalExpenses" DECIMAL(65,30),
    "netBalance" DECIMAL(65,30),
    "topCategory" TEXT,
    "topCategoryPct" DOUBLE PRECISION,
    "summary" TEXT NOT NULL,
    "highlights" JSONB,
    "recommendations" JSONB,
    "metrics" JSONB,
    "source" TEXT NOT NULL DEFAULT 'RULE_BASED',
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_insights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'GENERAL',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "actionUrl" TEXT,
    "metadata" JSONB,
    "dedupeKey" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "financial_insights_userId_year_month_idx" ON "financial_insights"("userId", "year", "month");

-- CreateIndex
CREATE INDEX "financial_insights_accountId_year_month_idx" ON "financial_insights"("accountId", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "financial_insights_userId_scopeKey_month_year_key" ON "financial_insights"("userId", "scopeKey", "month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "notifications_dedupeKey_key" ON "notifications"("dedupeKey");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_createdAt_idx" ON "notifications"("userId", "isRead", "createdAt");

-- CreateIndex
CREATE INDEX "notifications_userId_createdAt_idx" ON "notifications"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "transactions_userId_date_idx" ON "transactions"("userId", "date");

-- CreateIndex
CREATE INDEX "transactions_accountId_date_idx" ON "transactions"("accountId", "date");

-- CreateIndex
CREATE INDEX "transactions_userId_accountId_date_idx" ON "transactions"("userId", "accountId", "date");

-- AddForeignKey
ALTER TABLE "financial_insights" ADD CONSTRAINT "financial_insights_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_insights" ADD CONSTRAINT "financial_insights_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
