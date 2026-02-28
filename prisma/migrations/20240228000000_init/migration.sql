-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "initialBalanceIqd" INTEGER NOT NULL DEFAULT 0,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kind" TEXT NOT NULL,
    "amountIqd" INTEGER NOT NULL,
    "sourceId" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "fxEnabled" BOOLEAN NOT NULL DEFAULT false,
    "fxFromCurrency" TEXT,
    "fxToCurrency" TEXT,
    "fxRate" REAL,
    "fxFromAmount" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Transaction_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Debt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "direction" TEXT NOT NULL,
    "personName" TEXT NOT NULL,
    "amountIqd" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "sourceId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Debt_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MonthlyExpenseTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "amountIqd" INTEGER NOT NULL,
    "sourceId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MonthlyExpenseTemplate_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MonthlyExpenseApplyLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "monthKey" TEXT NOT NULL,
    "appliedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "MonthlyTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MonthlyTemplateItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amountIqd" INTEGER NOT NULL,
    "kind" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "MonthlyTemplateItem_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "MonthlyTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MonthlyTemplateItem_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MonthlyTemplateApplyLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "monthKey" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "appliedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MonthlyTemplateApplyLog_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "MonthlyTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyExpenseApplyLog_monthKey_key" ON "MonthlyExpenseApplyLog"("monthKey");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyTemplateApplyLog_monthKey_templateId_key" ON "MonthlyTemplateApplyLog"("monthKey", "templateId");
