
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const imports = await prisma.productImport.findMany({
      include: {
        affiliateProgram: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        importDate: 'desc'
      }
    });

    const formattedImports = imports.map(importRecord => ({
      id: importRecord.id,
      importDate: importRecord.importDate.toISOString(),
      status: importRecord.status,
      recordsProcessed: importRecord.recordsProcessed,
      recordsSuccess: importRecord.recordsSuccess,
      recordsError: importRecord.recordsError,
      errorLog: importRecord.errorLog,
      fileName: importRecord.fileName,
      xmlFormat: importRecord.xmlFormat,
      affiliateProgram: importRecord.affiliateProgram
    }));

    return NextResponse.json(formattedImports);
  } catch (error) {
    console.error('Error fetching import history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch import history' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE endpoint to clean up stuck imports
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const importId = url.searchParams.get('importId');

    if (importId) {
      // Delete specific import
      await prisma.productImport.delete({
        where: { id: importId }
      });

      return NextResponse.json({ success: true, message: 'Import deleted successfully' });
    } else {
      // Clean up all stuck imports (older than 1 hour and still processing)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      const result = await prisma.productImport.updateMany({
        where: {
          status: 'PROCESSING',
          importDate: {
            lt: oneHourAgo
          }
        },
        data: {
          status: 'FAILED',
          errorLog: 'Import timed out - automatically marked as failed'
        }
      });

      return NextResponse.json({ 
        success: true, 
        message: `Cleaned up ${result.count} stuck imports` 
      });
    }
  } catch (error) {
    console.error('Error during cleanup:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup imports' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
