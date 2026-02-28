'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { prisma } from '@/lib/db';
import { parseAmountIqd, IQD_AMOUNT_ERROR } from '@/lib/currency';

function parseAmount(v: unknown): number | null {
  if (v == null || v === '') return null;
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

export async function quickAddExpense(amountIqd: number, sourceId: string) {
  const amt = parseAmountIqd(amountIqd);
  if (!amt) return { error: IQD_AMOUNT_ERROR };
  const source = await prisma.source.findFirst({ where: { id: sourceId, isArchived: false } });
  if (!source) return { error: 'Invalid source' };
  await prisma.transaction.create({
    data: { kind: 'EXPENSE', amountIqd: amt, sourceId, date: new Date() },
  });
  revalidatePath('/');
  revalidatePath('/transactions');
  revalidateTag('source-balances');
  return {};
}

export async function addDeposit(formData: FormData) {
  const sourceId = formData.get('sourceId') as string;
  const amount = parseAmountIqd(formData.get('amountIqd'));
  if (!amount) return { error: IQD_AMOUNT_ERROR };
  const source = await prisma.source.findFirst({ where: { id: sourceId, isArchived: false } });
  if (!source) return { error: 'Invalid source' };
  const fxEnabled = formData.get('fxEnabled') === 'true';
  const data: Parameters<typeof prisma.transaction.create>[0]['data'] = {
    kind: 'DEPOSIT',
    amountIqd: amount,
    sourceId,
    date: new Date(),
    note: (formData.get('note') as string) || undefined,
  };
  if (fxEnabled) {
    data.fxEnabled = true;
    data.fxFromCurrency = (formData.get('fxFromCurrency') as string) || 'USD';
    data.fxToCurrency = 'IQD';
    const rate = Number(formData.get('fxRate'));
    data.fxRate = Number.isFinite(rate) ? rate : undefined;
    const fromAmt = parseAmount(formData.get('fxFromAmount'));
    data.fxFromAmount = fromAmt ?? undefined;
  }
  await prisma.transaction.create({ data });
  revalidatePath('/');
  revalidatePath('/transactions');
  revalidateTag('source-balances');
  return {};
}

export async function addWithdraw(formData: FormData) {
  const sourceId = formData.get('sourceId') as string;
  const amount = parseAmountIqd(formData.get('amountIqd'));
  if (!amount) return { error: IQD_AMOUNT_ERROR };
  const source = await prisma.source.findFirst({ where: { id: sourceId, isArchived: false } });
  if (!source) return { error: 'Invalid source' };
  const fxEnabled = formData.get('fxEnabled') === 'true';
  const data: Parameters<typeof prisma.transaction.create>[0]['data'] = {
    kind: 'WITHDRAW',
    amountIqd: amount,
    sourceId,
    date: new Date(),
    note: (formData.get('note') as string) || undefined,
  };
  if (fxEnabled) {
    data.fxEnabled = true;
    data.fxFromCurrency = (formData.get('fxFromCurrency') as string) || 'USD';
    data.fxToCurrency = 'IQD';
    const rate = Number(formData.get('fxRate'));
    data.fxRate = Number.isFinite(rate) ? rate : undefined;
    const fromAmt = parseAmount(formData.get('fxFromAmount'));
    data.fxFromAmount = fromAmt ?? undefined;
  }
  await prisma.transaction.create({ data });
  revalidatePath('/');
  revalidatePath('/transactions');
  revalidateTag('source-balances');
  return {};
}

export async function getTransactions(limit = 100) {
  return prisma.transaction.findMany({
    include: { source: true },
    orderBy: { date: 'desc' },
    take: limit,
  });
}

export async function getTransaction(id: string) {
  return prisma.transaction.findUnique({
    where: { id },
    include: { source: true },
  });
}

export async function updateTransaction(id: string, formData: FormData) {
  const existing = await prisma.transaction.findUnique({ where: { id } });
  if (!existing) return { error: 'Transaction not found' };
  const amount = parseAmountIqd(formData.get('amountIqd'));
  if (!amount) return { error: IQD_AMOUNT_ERROR };
  const sourceId = formData.get('sourceId') as string;
  const source = await prisma.source.findFirst({ where: { id: sourceId, isArchived: false } });
  if (!source) return { error: 'Invalid source' };
  const kind = (formData.get('kind') as string) || existing.kind;
  const note = (formData.get('note') as string)?.trim() || null;
  const dateStr = formData.get('date') as string;
  const date = dateStr ? new Date(dateStr) : existing.date;
  const fxEnabled = formData.get('fxEnabled') === 'true';
  const data: Parameters<typeof prisma.transaction.update>[0]['data'] = {
    kind,
    amountIqd: amount,
    sourceId,
    date,
    note: note || undefined,
    fxEnabled,
    fxFromCurrency: null,
    fxToCurrency: null,
    fxRate: null,
    fxFromAmount: null,
  };
  if (fxEnabled) {
    data.fxFromCurrency = (formData.get('fxFromCurrency') as string) || 'USD';
    data.fxToCurrency = 'IQD';
    const rate = Number(formData.get('fxRate'));
    data.fxRate = Number.isFinite(rate) ? rate : undefined;
    const fromAmt = parseAmount(formData.get('fxFromAmount'));
    data.fxFromAmount = fromAmt ?? undefined;
  }
  await prisma.transaction.update({ where: { id }, data });
  revalidatePath('/');
  revalidatePath('/transactions');
  revalidatePath(`/transactions/${id}`);
  revalidateTag('source-balances');
  return {};
}

function monthRange(year: number, month: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
}

export async function getTransactionsForMonth(year: number, month: number) {
  const { start, end } = monthRange(year, month);
  return prisma.transaction.findMany({
    where: { date: { gte: start, lte: end } },
    include: { source: true },
    orderBy: { date: 'desc' },
  });
}

export async function getMonthSummary(year: number, month: number) {
  const { start, end } = monthRange(year, month);
  const rows = await prisma.transaction.findMany({
    where: { date: { gte: start, lte: end } },
    select: { kind: true, amountIqd: true },
  });
  let inTotal = 0;
  let outTotal = 0;
  for (const r of rows) {
    if (r.kind === 'INCOME' || r.kind === 'DEPOSIT') inTotal += r.amountIqd;
    else if (r.kind === 'EXPENSE' || r.kind === 'WITHDRAW') outTotal += r.amountIqd;
  }
  return { inTotal, outTotal, net: inTotal - outTotal };
}
