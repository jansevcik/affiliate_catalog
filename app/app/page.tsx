
'use client';

import { useState, useEffect } from 'react';
import { ProductGrid } from '@/components/product-grid';
import { CategorySidebar } from '@/components/category-sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter, SortAsc } from 'lucide-react';

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

interface ProductResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategoryId, searchQuery, minPrice, maxPrice, sortBy, currentPage]);

  // Listen for search events from header
  useEffect(() => {
    const handleSearchEvent = (event: CustomEvent) => {
      setSearchQuery(event.detail);
      setCurrentPage(1);
    };

    window.addEventListener('searchQuery', handleSearchEvent as EventListener);
    
    return () => {
      window.removeEventListener('searchQuery', handleSearchEvent as EventListener);
    };
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      });

      if (selectedCategoryId) params.set('categoryId', selectedCategoryId);
      if (searchQuery) params.set('search', searchQuery);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);

      const response = await fetch(`/api/products?${params}`);
      if (response.ok) {
        const data: ProductResponse = await response.json();
        setProducts(data.products);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
    setCurrentPage(1);
  };

  const loadMore = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  return (
    <div className="flex min-h-screen">
      <CategorySidebar 
        onCategorySelect={handleCategorySelect}
        selectedCategoryId={selectedCategoryId}
      />
      
      <div className="flex-1 p-6">
        {/* Hero Section */}
        <section className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Objevte úžasné produkty
          </h1>
          <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
            Najděte nejlepší nabídky od důvěryhodných partnerů v různých kategoriích
          </p>
        </section>

        {/* Filters Section */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filtry a řazení
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? 'Skrýt' : 'Zobrazit'} filtry
              </Button>
            </div>
          </CardHeader>
          {showFilters && (
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Min. cena</label>
                  <Input
                    type="number"
                    placeholder="Minimální cena"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Max. cena</label>
                  <Input
                    type="number"
                    placeholder="Maximální cena"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Řadit podle</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Nejnovější</SelectItem>
                      <SelectItem value="price-low">Cena: od nejnižší</SelectItem>
                      <SelectItem value="price-high">Cena: od nejvyšší</SelectItem>
                      <SelectItem value="name">Název A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button variant="outline" onClick={clearFilters} className="w-full">
                    Vymazat filtry
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Products Grid */}
        <ProductGrid products={products} isLoading={isLoading} />

        {/* Load More */}
        {!isLoading && currentPage < totalPages && (
          <div className="text-center mt-8">
            <Button onClick={loadMore} size="lg">
              Načíst další produkty
            </Button>
          </div>
        )}

        {/* Pagination Info */}
        {!isLoading && products.length > 0 && (
          <div className="text-center mt-4 text-sm text-muted-foreground">
            Strana {currentPage} z {totalPages}
          </div>
        )}
      </div>
    </div>
  );
}
