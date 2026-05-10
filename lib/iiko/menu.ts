import { prisma } from '@/lib/prisma';
import { iikoRequest } from './client';

interface IikoNomenclature {
  groups: Array<{ id: string; name: string; parentGroup?: string }>;
  products: Array<{
    id: string;
    name: string;
    parentGroup: string;
    price: number;
    isDeleted: boolean;
  }>;
}

export async function syncPaymentTypes(organizationId: string) {
  const result = await iikoRequest<{
    paymentTypes: Array<{
      id: string;
      name: string;
      kind: string;
      isActive: boolean;
    }>;
  }>('/payment_types', { organizationId });

  for (const pt of result.paymentTypes) {
    await prisma.iikoPaymentType.upsert({
      where: { id: pt.id },
      create: {
        id: pt.id,
        name: pt.name,
        kind: pt.kind,
        isActive: pt.isActive,
      },
      update: { name: pt.name, kind: pt.kind, isActive: pt.isActive },
    });
  }

  return result.paymentTypes;
}

function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[ёе]/g, 'е')
    .replace(/[^а-яa-z0-9\s]/g, '')
    .replace(/\s+/g, ' ');
}

export async function syncMenuFromIiko(organizationId: string) {
  const result = await iikoRequest<IikoNomenclature>('/nomenclature', {
    organizationId,
  });

  let matched = 0;
  let total = 0;

  for (const iikoProduct of result.products.filter((p) => !p.isDeleted)) {
    total++;
    const normalized = normalizeString(iikoProduct.name);

    const localProducts = await prisma.product.findMany({
      where: {
        isAvailable: true,
      },
    });

    let bestMatch = null;
    let bestScore = 0;

    for (const local of localProducts) {
      const localNormalized = normalizeString(local.name);
      const similarity = calculateSimilarity(normalized, localNormalized);

      if (similarity > bestScore && similarity > 0.6) {
        bestScore = similarity;
        bestMatch = local;
      }
    }

    if (bestMatch) {
      await prisma.product.update({
        where: { id: bestMatch.id },
        data: {
          iikoProductId: iikoProduct.id,
          iikoGroupId: iikoProduct.parentGroup,
          price: Math.round(iikoProduct.price * 100),
        },
      });
      matched++;
    }
  }

  return { matched, total };
}

function calculateSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  if (a.includes(b) || b.includes(a)) return 0.8;

  const aWords = a.split(' ');
  const bWords = b.split(' ');
  const commonWords = aWords.filter((w) => bWords.includes(w));

  if (commonWords.length === 0) return 0;

  return commonWords.length / Math.max(aWords.length, bWords.length);
}