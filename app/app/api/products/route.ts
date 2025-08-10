
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AffiliateLinkGenerator } from '@/lib/affiliate-link';

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Validate and parse parameters
    const pageParam = searchParams.get('page') || '1';
    const limitParam = searchParams.get('limit') || '20';
    const minPriceParam = searchParams.get('minPrice');
    const maxPriceParam = searchParams.get('maxPrice');
    
    const page = parseInt(pageParam);
    const limit = parseInt(limitParam);
    
    // Validate page and limit
    if (isNaN(page) || page < 1) {
      return NextResponse.json(
        { error: 'Neplatná stránka. Stránka musí být kladné číslo.' },
        { status: 400 }
      );
    }
    
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Neplatný limit. Limit musí být mezi 1 a 100.' },
        { status: 400 }
      );
    }
    
    // Parse and validate price parameters
    let minPrice: number | undefined = undefined;
    let maxPrice: number | undefined = undefined;
    
    if (minPriceParam) {
      minPrice = parseFloat(minPriceParam);
      if (isNaN(minPrice) || minPrice < 0) {
        return NextResponse.json(
          { error: 'Neplatná minimální cena. Musí být nezáporné číslo.' },
          { status: 400 }
        );
      }
    }
    
    if (maxPriceParam) {
      maxPrice = parseFloat(maxPriceParam);
      if (isNaN(maxPrice) || maxPrice < 0) {
        return NextResponse.json(
          { error: 'Neplatná maximální cena. Musí být nezáporné číslo.' },
          { status: 400 }
        );
      }
    }
    
    if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
      return NextResponse.json(
        { error: 'Minimální cena nemůže být vyšší než maximální cena.' },
        { status: 400 }
      );
    }
    
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId');
    const brand = searchParams.get('brand');

    const skip = (page - 1) * limit;

    const where: any = {
      isActive: true,
      AND: []
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (brand) {
      where.brand = { contains: brand, mode: 'insensitive' };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          affiliateProgram: true,
          attributes: true
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    const productsWithAffiliateLinks = products.map(product => ({
      ...product,
      affiliateLink: AffiliateLinkGenerator.generateAffiliateLink(
        product.affiliateProgram.baseUrl,
        product.originalUrl
      )
    }));

    return NextResponse.json({
      products: productsWithAffiliateLinks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
