
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, XmlFormat, ImportStatus } from '@prisma/client';
import { XmlParser } from '@/lib/xml-parser';
import { CategoryUtils } from '@/lib/category-utils';

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  let importRecord = null;

  try {
    const formData = await request.formData();
    const file = formData.get('xmlFile') as File;
    const affiliateProgramId = formData.get('affiliateProgramId') as string;
    const xmlFormat = formData.get('xmlFormat') as XmlFormat;

    if (!file || !affiliateProgramId || !xmlFormat) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify affiliate program exists
    const affiliateProgram = await prisma.affiliateProgram.findUnique({
      where: { id: affiliateProgramId }
    });

    if (!affiliateProgram) {
      return NextResponse.json(
        { error: 'Affiliate program not found' },
        { status: 404 }
      );
    }

    // Create import record
    importRecord = await prisma.productImport.create({
      data: {
        affiliateProgramId,
        xmlFormat,
        fileName: file.name,
        status: ImportStatus.PROCESSING
      }
    });

    const xmlContent = await file.text();
    const parsedProducts = await XmlParser.parseXml(xmlContent, xmlFormat);

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const parsedProduct of parsedProducts) {
      try {
        // Find or create category
        let categoryId = null;
        if (parsedProduct.category) {
          const categoryHierarchy = CategoryUtils.parseProductType(parsedProduct.category);
          categoryId = await findOrCreateCategoryHierarchy(categoryHierarchy);
        }

        // Upsert product
        await prisma.product.upsert({
          where: {
            affiliateProgramId_externalId: {
              affiliateProgramId,
              externalId: parsedProduct.externalId
            }
          },
          update: {
            name: parsedProduct.name,
            description: parsedProduct.description,
            price: parsedProduct.price,
            salePrice: parsedProduct.salePrice,
            originalUrl: parsedProduct.originalUrl,
            imageUrl: parsedProduct.imageUrl,
            brand: parsedProduct.brand,
            model: parsedProduct.model,
            sku: parsedProduct.sku,
            ean: parsedProduct.ean,
            availability: parsedProduct.availability,
            condition: parsedProduct.condition,
            shippingWeight: parsedProduct.shippingWeight,
            categoryId,
            updatedAt: new Date(),
            attributes: {
              deleteMany: {},
              create: parsedProduct.attributes
            }
          },
          create: {
            externalId: parsedProduct.externalId,
            name: parsedProduct.name,
            description: parsedProduct.description,
            price: parsedProduct.price,
            salePrice: parsedProduct.salePrice,
            originalUrl: parsedProduct.originalUrl,
            imageUrl: parsedProduct.imageUrl,
            brand: parsedProduct.brand,
            model: parsedProduct.model,
            sku: parsedProduct.sku,
            ean: parsedProduct.ean,
            availability: parsedProduct.availability,
            condition: parsedProduct.condition,
            shippingWeight: parsedProduct.shippingWeight,
            affiliateProgramId,
            categoryId,
            attributes: {
              create: parsedProduct.attributes
            }
          }
        });

        successCount++;
      } catch (error) {
        errorCount++;
        const errorMsg = `Product ${parsedProduct.externalId}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMsg);
        console.error('Error importing product:', errorMsg);
      }
    }

    // Update import record
    await prisma.productImport.update({
      where: { id: importRecord.id },
      data: {
        status: ImportStatus.COMPLETED,
        recordsProcessed: parsedProducts.length,
        recordsSuccess: successCount,
        recordsError: errorCount,
        errorLog: errors.length > 0 ? errors.join('\n') : null
      }
    });

    return NextResponse.json({
      success: true,
      importId: importRecord.id,
      summary: {
        totalRecords: parsedProducts.length,
        successfulImports: successCount,
        errors: errorCount,
        errorDetails: errors.slice(0, 10) // Limit error details in response
      }
    });

  } catch (error) {
    console.error('Import error:', error);

    // Update import record with error
    if (importRecord) {
      await prisma.productImport.update({
        where: { id: importRecord.id },
        data: {
          status: ImportStatus.FAILED,
          errorLog: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }

    return NextResponse.json(
      { error: 'Import failed: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

async function findOrCreateCategoryHierarchy(categoryHierarchy: string[]): Promise<string | null> {
  if (categoryHierarchy.length === 0) return null;

  let parentId = null;

  for (const categoryName of categoryHierarchy) {
    const slug = CategoryUtils.createSlug(categoryName);

    const category: any = await prisma.category.upsert({
      where: { slug },
      update: {},
      create: {
        name: categoryName,
        slug,
        parentId
      }
    });

    parentId = category.id;
  }

  return parentId;
}
