'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { parseAmountIqd, IQD_AMOUNT_ERROR } from '@/lib/currency';
import { getSourceBalancesUncached } from '@/lib/actions/sources';
import { ar } from '@/lib/ar';

/** Multi-entry templates (name + items with description, amount, source, kind) */
export async function getMonthlyTemplates() {
  return await prisma.monthlyTemplate.findMany({
    include: {
      items: {
        include: { source: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
    orderBy: { createdAt: 'asc' },
  });
}

export type TemplateItemInput = {
  name: string;
  amountIqd: number;
  sourceId: string;
  kind: 'INCOME' | 'EXPENSE';
};

export async function createMonthlyTemplate(formData: FormData) {
  const name = (formData.get('name') as string)?.trim();
  if (!name) return { error: 'Template name is required' };
  const itemsJson = formData.get('items') as string;
  let items: TemplateItemInput[];
  try {
    items = JSON.parse(itemsJson || '[]') as TemplateItemInput[];
  } catch {
    return { error: 'Invalid items' };
  }
  if (items.length === 0) return { error: 'Add at least one entry (income or expense)' };
  const sourceIds = Array.from(new Set(items.map((i) => i.sourceId)));
  const sources = await prisma.source.findMany({
    where: { id: { in: sourceIds }, isArchived: false },
    select: { id: true },
  });
  const validIds = new Set(sources.map((s) => s.id));
  for (const it of items) {
    if (!(it.name && typeof it.name === 'string' && it.name.trim())) return { error: 'Each entry needs a description' };
    if (!validIds.has(it.sourceId)) return { error: 'Invalid source for an entry' };
    const amt = parseAmountIqd(it.amountIqd);
    if (!amt) return { error: IQD_AMOUNT_ERROR };
    if (it.kind !== 'INCOME' && it.kind !== 'EXPENSE') return { error: 'Each entry must be Income or Expense' };
  }
  await prisma.monthlyTemplate.create({
    data: {
      name,
      isActive: true,
      items: {
        create: items.map((it, i) => ({
          name: it.name.trim(),
          amountIqd: it.amountIqd,
          sourceId: it.sourceId,
          kind: it.kind,
          sortOrder: i,
        })),
      },
    },
  });
  revalidatePath('/settings');
  return {};
}

export async function updateMonthlyTemplate(id: string, formData: FormData) {
  const name = (formData.get('name') as string)?.trim();
  if (!name) return { error: 'Template name is required' };
  const itemsJson = formData.get('items') as string;
  let items: TemplateItemInput[];
  try {
    items = JSON.parse(itemsJson || '[]') as TemplateItemInput[];
  } catch {
    return { error: 'Invalid items' };
  }
  if (items.length === 0) return { error: 'Add at least one entry' };
  const sourceIds = Array.from(new Set(items.map((i) => i.sourceId)));
  const sources = await prisma.source.findMany({
    where: { id: { in: sourceIds }, isArchived: false },
    select: { id: true },
  });
  const validIds = new Set(sources.map((s) => s.id));
  for (const it of items) {
    if (!(it.name && typeof it.name === 'string' && it.name.trim())) return { error: 'Each entry needs a description' };
    if (!validIds.has(it.sourceId)) return { error: 'Invalid source for an entry' };
    const amt = parseAmountIqd(it.amountIqd);
    if (!amt) return { error: IQD_AMOUNT_ERROR };
    if (it.kind !== 'INCOME' && it.kind !== 'EXPENSE') return { error: 'Each entry must be Income or Expense' };
  }
  const isActive = formData.get('isActive') === 'true';
  await prisma.$transaction(async (tx) => {
    await tx.monthlyTemplateItem.deleteMany({ where: { templateId: id } });
    await tx.monthlyTemplate.update({
      where: { id },
      data: {
        name,
        isActive,
        items: {
          create: items.map((it, i) => ({
            name: it.name.trim(),
            amountIqd: it.amountIqd,
            sourceId: it.sourceId,
            kind: it.kind,
            sortOrder: i,
          })),
        },
      },
    });
  });
  revalidatePath('/settings');
  return {};
}

export async function deleteMonthlyTemplate(id: string) {
  await prisma.monthlyTemplate.delete({ where: { id } });
  revalidatePath('/settings');
  return {};
}

/** Returns template IDs that were already applied for this month */
export async function getApplyLog(monthKey: string) {
  const rows = await prisma.monthlyTemplateApplyLog.findMany({
    where: { monthKey },
    select: { templateId: true },
  });
  return { appliedTemplateIds: rows.map((r) => r.templateId) };
}

/** Apply one template for the month: create one transaction per item (with description and source) */
export async function applyMonthlyTemplate(monthKey: string, templateId: string) {
  const existing = await prisma.monthlyTemplateApplyLog.findUnique({
    where: { monthKey_templateId: { monthKey, templateId } },
  });
  if (existing) return { error: 'This template was already applied for this month' };
  const template = await prisma.monthlyTemplate.findUnique({
    where: { id: templateId },
    include: { items: { include: { source: true }, orderBy: { sortOrder: 'asc' } } },
  });
  if (!template) return { error: 'Template not found' };
  if (!template.isActive) return { error: 'Template is inactive' };
  if (template.items.length === 0) return { error: 'Template has no entries' };
  const sourceIds = Array.from(new Set(template.items.map((i) => i.sourceId)));
  const balances = await getSourceBalancesUncached(sourceIds);
  const afterBalance: Record<string, number> = { ...balances };
  for (const item of template.items) {
    if (item.kind === 'INCOME' || item.kind === 'DEPOSIT') {
      afterBalance[item.sourceId] = (afterBalance[item.sourceId] ?? 0) + item.amountIqd;
    } else {
      afterBalance[item.sourceId] = (afterBalance[item.sourceId] ?? 0) - item.amountIqd;
      if (afterBalance[item.sourceId] < 0) return { error: ar.errors.insufficientBalance };
    }
  }
  const [y, m] = monthKey.split('-').map(Number);
  const date = new Date(y, m - 1, 1);
  await prisma.$transaction(async (tx) => {
    await tx.monthlyTemplateApplyLog.create({ data: { monthKey, templateId } });
    for (const item of template.items) {
      await tx.transaction.create({
        data: {
          kind: item.kind,
          amountIqd: item.amountIqd,
          sourceId: item.sourceId,
          date,
          note: item.name,
        },
      });
    }
  });
  revalidatePath('/');
  revalidatePath('/transactions');
  revalidatePath('/settings');
  return {};
}
