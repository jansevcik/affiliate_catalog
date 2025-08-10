
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const programs = await prisma.affiliateProgram.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            products: true,
            productImports: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(programs);
  } catch (error) {
    console.error('Error fetching affiliate programs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch affiliate programs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, baseUrl, commissionRate, cookieDays, restrictions } = body;

    if (!name || !baseUrl || commissionRate === undefined || !cookieDays) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const program = await prisma.affiliateProgram.create({
      data: {
        name,
        baseUrl,
        commissionRate,
        cookieDays,
        restrictions: restrictions || null
      }
    });

    return NextResponse.json(program, { status: 201 });
  } catch (error) {
    console.error('Error creating affiliate program:', error);
    return NextResponse.json(
      { error: 'Failed to create affiliate program' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, baseUrl, commissionRate, cookieDays, restrictions } = body;

    if (!id || !name || !baseUrl || commissionRate === undefined || !cookieDays) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const program = await prisma.affiliateProgram.update({
      where: { id },
      data: {
        name,
        baseUrl,
        commissionRate,
        cookieDays,
        restrictions: restrictions || null
      }
    });

    return NextResponse.json(program);
  } catch (error) {
    console.error('Error updating affiliate program:', error);
    return NextResponse.json(
      { error: 'Failed to update affiliate program' },
      { status: 500 }
    );
  }
}
