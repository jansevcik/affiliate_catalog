
'use client';

import Link from 'next/link';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
  BreadcrumbEllipsis
} from '@/components/ui/breadcrumb';
import { Home } from 'lucide-react';

interface ProductBreadcrumbProps {
  category?: {
    id: string;
    name: string;
  };
  productName: string;
}

export function ProductBreadcrumb({ category, productName }: ProductBreadcrumbProps) {
  const formatCategoryName = (categoryName: string): string => {
    // Remove common prefixes and split by separators
    const cleanName = categoryName
      .replace(/^[^|]*\|\s*/, '') // Remove "Heureka.cz | " prefix
      .split('|')
      .map(part => part.trim())
      .filter(part => part.length > 0);
    
    // Return the last meaningful category (usually the most specific one)
    if (cleanName.length > 0) {
      return cleanName[cleanName.length - 1];
    }
    
    return categoryName;
  };

  const truncateProductName = (name: string, maxLength: number = 40): string => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + '...';
  };

  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/" className="flex items-center">
              <Home className="h-4 w-4 mr-1" />
              Domů
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        
        <BreadcrumbSeparator />
        
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">
              Produkty
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {category && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/?categoryId=${category.id}`}>
                  {formatCategoryName(category.name)}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </>
        )}

        <BreadcrumbSeparator />
        
        <BreadcrumbItem>
          <BreadcrumbPage>
            {truncateProductName(productName)}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
