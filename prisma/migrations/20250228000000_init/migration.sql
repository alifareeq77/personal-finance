-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "initialBalanceIqd" INTEGER NOT NULL DEFAULT 0,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "amountIqd" INTEGER NOT NULL,
    "sourceId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "fxEnabled" BOOLEAN NOT NULL DEFAULT false,
    "fxFromCurrency" TEXT,
    "fxToCurrency" TEXT,
    "fxRate" DOUBLE PRECISION,
    "fxFromAmount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Debt" (
    "id" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "personName" TEXT NOT NULL,
    "amountIqd" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "sourceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Debt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyExpenseTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amountIqd" INTEGER NOT NULL,
    "sourceId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyExpenseTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyExpenseApplyLog" (
    "id" TEXT NOT NULL,
    "monthKey" TEXT NOT NULL,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MonthlyExpenseApplyLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyTemplateItem" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amountIqd" INTEGER NOT NULL,
    "kind" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MonthlyTemplateItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyTemplateApplyLog" (
    "id" TEXT NOT NULL,
    "monthKey" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MonthlyTemplateApplyLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyExpenseApplyLog_monthKey_key" ON "MonthlyExpenseApplyLog"("monthKey");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyTemplateApplyLog_monthKey_templateId_key" ON "MonthlyTemplateApplyLog"("monthKey", "templateId");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Debt" ADD CONSTRAINT "Debt_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyExpenseTemplate" ADD CONSTRAINT "MonthlyExpenseTemplate_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyTemplateItem" ADD CONSTRAINT "MonthlyTemplateItem_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "MonthlyTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyTemplateItem" ADD CONSTRAINT "MonthlyTemplateItem_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyTemplateApplyLog" ADD CONSTRAINT "MonthlyTemplateApplyLog_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "MonthlyTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
