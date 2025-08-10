
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { CategoryUtils } from '@/lib/category-utils';

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tree = searchParams.get('tree') === 'true';

    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            products: true,
            children: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    if (tree) {
      const categoryTree = CategoryUtils.buildCategoryTree(categories);
      return NextResponse.json(categoryTree);
    }

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, parentId, description, imageUrl } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    const slug = CategoryUtils.createSlug(name);

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        parentId: parentId || undefined,
        description,
        imageUrl
      }
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
