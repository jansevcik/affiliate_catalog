
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
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
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Neautorizovaný přístup' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, baseUrl, commissionRate, cookieDays, restrictions } = body;

    if (!name || !baseUrl || commissionRate === undefined || !cookieDays) {
      return NextResponse.json(
        { error: 'Chybí povinná pole' },
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
      { error: 'Chyba při vytváření affiliate programu' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Neautorizovaný přístup' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, name, baseUrl, commissionRate, cookieDays, restrictions } = body;

    if (!id || !name || !baseUrl || commissionRate === undefined || !cookieDays) {
      return NextResponse.json(
        { error: 'Chybí povinná pole' },
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
      { error: 'Chyba při aktualizaci affiliate programu' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Neautorizovaný přístup' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID affiliate programu je povinné' },
        { status: 400 }
      );
    }

    // Nejprve zkontrolujeme, jestli program má produkty
    const program = await prisma.affiliateProgram.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    });

    if (!program) {
      return NextResponse.json(
        { error: 'Affiliate program nenalezen' },
        { status: 404 }
      );
    }

    if (program._count.products > 0) {
      // Pokud má program produkty, jen ho deaktivujeme místo smazání
      await prisma.affiliateProgram.update({
        where: { id },
        data: { isActive: false }
      });
      
      return NextResponse.json(
        { message: 'Program byl deaktivován kvůli existujícím produktům' },
        { status: 200 }
      );
    } else {
      // Pokud nemá produkty, můžeme ho bezpečně smazat
      await prisma.affiliateProgram.delete({
        where: { id }
      });
      
      return NextResponse.json(
        { message: 'Program byl úspěšně smazán' },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Error deleting affiliate program:', error);
    return NextResponse.json(
      { error: 'Chyba při mazání affiliate programu' },
      { status: 500 }
    );
  }
}
