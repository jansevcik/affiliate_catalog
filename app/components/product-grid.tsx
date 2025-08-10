
'use client';

import { ProductCard } from './product-card';

interface Product {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  currency: string;
  imageUrl?: string;
  brand?: string;
  availability?: string;
  affiliateLink: string;
  category?: {
    name: string;
  };
}

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
}

export function ProductGrid({ products, isLoading }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-4 lg:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-muted animate-pulse rounded-lg h-72 md:h-80" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12 md:py-16">
        <p className="text-base md:text-lg text-muted-foreground">Žádné produkty nebyly nalezeny</p>
        <p className="text-sm text-muted-foreground mt-2">Zkuste upravit vyhledávání nebo filtry</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-4 lg:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
