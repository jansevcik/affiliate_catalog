
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AffiliateLinkGenerator } from '@/lib/affiliate-link';

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        affiliateProgram: true,
        attributes: true
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const productWithAffiliateLink = {
      ...product,
      affiliateLink: AffiliateLinkGenerator.generateAffiliateLink(
        product.affiliateProgram.baseUrl,
        product.originalUrl
      )
    };

    return NextResponse.json(productWithAffiliateLink);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
