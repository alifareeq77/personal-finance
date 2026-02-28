'use server';

import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache';
import { prisma } from '@/lib/db';
import { parseAmountIqd, IQD_AMOUNT_ERROR } from '@/lib/currency';

export async function getSources(includeArchived = false) {
  return unstable_cache(
    async () =>
      prisma.source.findMany({
        where: includeArchived ? undefined : { isArchived: false },
        orderBy: { createdAt: 'asc' },
      }),
    ['sources', includeArchived ? 'archived' : 'active'],
    { revalidate: 60, tags: ['sources'] }
  )();
}

export async function createSource(formData: FormData) {
  const name = (formData.get('name') as string)?.trim();
  if (!name) return { error: 'Name is required' };
  const initialRaw = formData.get('initialBalanceIqd');
  const initialBalanceIqd = initialRaw === null || initialRaw === '' || (typeof initialRaw === 'string' && initialRaw.trim() === '')
    ? 0
    : parseAmountIqd(initialRaw);
  if (initialBalanceIqd === null) return { error: IQD_AMOUNT_ERROR };
  await prisma.source.create({
    data: { name, type: (formData.get('type') as string) || undefined, initialBalanceIqd },
  });
  revalidatePath('/');
  revalidatePath('/settings');
  revalidateTag('sources');
  return {};
}

export async function updateSource(id: string, formData: FormData) {
  const name = (formData.get('name') as string)?.trim();
  if (!name) return { error: 'Name is required' };
  const initialRaw = formData.get('initialBalanceIqd');
  const initialBalanceIqd = initialRaw === null || initialRaw === '' || (typeof initialRaw === 'string' && initialRaw.trim() === '')
    ? 0
    : parseAmountIqd(initialRaw);
  if (initialBalanceIqd === null) return { error: IQD_AMOUNT_ERROR };
  await prisma.source.update({
    where: { id },
    data: { name, type: (formData.get('type') as string) || undefined, initialBalanceIqd },
  });
  revalidatePath('/');
  revalidatePath('/settings');
  revalidateTag('sources');
  return {};
}

export async function archiveSource(id: string) {
  await prisma.source.update({
    where: { id },
    data: { isArchived: true },
  });
  revalidatePath('/');
  revalidatePath('/settings');
  revalidateTag('sources');
  return {};
}

export async function unarchiveSource(id: string) {
  await prisma.source.update({
    where: { id },
    data: { isArchived: false },
  });
  revalidatePath('/');
  revalidatePath('/settings');
  revalidateTag('sources');
  return {};
}
