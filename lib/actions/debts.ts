'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { parseAmountIqd, IQD_AMOUNT_ERROR } from '@/lib/currency';
import { getSourceBalancesUncached } from '@/lib/actions/sources';
import { ar } from '@/lib/ar';

export async function getDebts() {
  const debts = await prisma.debt.findMany({
    orderBy: { date: 'asc' },
  });
  const sourceIds = Array.from(new Set(debts.map((d) => d.sourceId).filter(Boolean))) as string[];
  const sources = sourceIds.length
    ? await prisma.source.findMany({
        where: { id: { in: sourceIds } },
        select: { id: true, name: true },
      })
    : [];
  const sourceMap = Object.fromEntries(sources.map((s) => [s.id, s]));
  return debts.map((d) => ({
    ...d,
    source: d.sourceId ? sourceMap[d.sourceId] ?? null : null,
  }));
}

export async function getDebtTotals() {
  const rows = await prisma.debt.findMany({
    where: { status: 'OPEN' },
    select: { direction: true, amountIqd: true },
  });
  let receivable = 0;
  let payable = 0;
  for (const r of rows) {
    const amount = Number(r.amountIqd) || 0;
    if (r.direction === 'RECEIVABLE') receivable += amount;
    else payable += amount;
  }
  return { receivable, payable, net: receivable - payable };
}

export async function addDebt(formData: FormData) {
  const direction = formData.get('direction') as string;
  if (direction !== 'RECEIVABLE' && direction !== 'PAYABLE') return { error: 'Invalid direction' };
  const personName = ((formData.get('personName') as string) || 'Unknown').trim();
  const amount = parseAmountIqd(formData.get('amountIqd'));
  if (!amount) return { error: IQD_AMOUNT_ERROR };
  const sourceId = (formData.get('sourceId') as string)?.trim() || null;
  if (sourceId) {
    const source = await prisma.source.findFirst({ where: { id: sourceId, isArchived: false } });
    if (!source) return { error: 'Invalid source' };
  }
  await prisma.debt.create({
    data: {
      direction,
      personName: personName || 'Unknown',
      amountIqd: amount,
      status: 'OPEN',
      note: (formData.get('note') as string) || undefined,
      sourceId: sourceId || undefined,
    },
  });
  revalidatePath('/debts');
  return {};
}

export async function settleDebt(id: string) {
  const debt = await prisma.debt.findUnique({ where: { id } });
  if (!debt) return { error: 'Debt not found' };
  if (debt.status === 'SETTLED') return { error: 'Already settled' };

  if (debt.sourceId) {
    const note = `Settled debt: ${debt.personName}`;
    if (debt.direction === 'RECEIVABLE') {
      await prisma.transaction.create({
        data: {
          kind: 'INCOME',
          amountIqd: debt.amountIqd,
          sourceId: debt.sourceId,
          date: new Date(),
          note,
        },
      });
    } else {
      const balances = await getSourceBalancesUncached([debt.sourceId]);
      if ((balances[debt.sourceId] ?? 0) < debt.amountIqd)
        return { error: ar.errors.insufficientBalance };
      await prisma.transaction.create({
        data: {
          kind: 'EXPENSE',
          amountIqd: debt.amountIqd,
          sourceId: debt.sourceId,
          date: new Date(),
          note,
        },
      });
    }
  }

  await prisma.debt.update({
    where: { id },
    data: { status: 'SETTLED' },
  });
  revalidatePath('/debts');
  revalidatePath('/transactions');
  revalidatePath('/');
  return {};
}
