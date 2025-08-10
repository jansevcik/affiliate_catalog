
import { notFound } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { ProductDetailClient } from '@/components/product-detail-client';
import { AffiliateLinkGenerator } from '@/lib/affiliate-link';

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

interface PageProps {
  params: { id: string };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      category: true,
      affiliateProgram: true,
      attributes: true
    }
  });

  if (!product) {
    notFound();
  }

  const productWithAffiliateLink = {
    ...product,
    description: product.description || undefined,
    salePrice: product.salePrice || undefined,
    imageUrl: product.imageUrl || undefined,
    brand: product.brand || undefined,
    model: product.model || undefined,
    sku: product.sku || undefined,
    ean: product.ean || undefined,
    availability: product.availability || undefined,
    condition: product.condition || undefined,
    shippingWeight: product.shippingWeight || undefined,
    category: product.category ? { id: product.category.id, name: product.category.name } : undefined,
    affiliateLink: AffiliateLinkGenerator.generateAffiliateLink(
      product.affiliateProgram.baseUrl,
      product.originalUrl
    )
  };

  return <ProductDetailClient product={productWithAffiliateLink} />;
}
