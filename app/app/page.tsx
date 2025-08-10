
'use client';

import { useState, useEffect } from 'react';
import { ProductGrid } from '@/components/product-grid';
import { CategorySidebar } from '@/components/category-sidebar';
import { MobileCategoryMenu } from '@/components/mobile-category-menu';
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
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <CategorySidebar 
          onCategorySelect={handleCategorySelect}
          selectedCategoryId={selectedCategoryId}
        />
      </div>
      
      <div className="flex-1 p-4 md:p-6">
        {/* Mobile Category Menu */}
        <MobileCategoryMenu 
          selectedCategory={selectedCategoryId || undefined}
          onCategoryChange={(categoryId) => handleCategorySelect(categoryId || null)}
        />
        
        {/* Hero Section */}
        <section className="mb-6 md:mb-8 text-center">
          <h1 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Objevte úžasné produkty
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-4 md:mb-6 max-w-2xl mx-auto">
            Najděte nejlepší nabídky od důvěryhodných partnerů v různých kategoriích
          </p>
        </section>

        {/* Filters Section */}
        <Card className="mb-4 md:mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-base md:text-lg">
                <Filter className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                Filtry a řazení
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="text-xs md:text-sm"
              >
                {showFilters ? 'Skrýt' : 'Zobrazit'} filtry
              </Button>
            </div>
          </CardHeader>
          {showFilters && (
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Min. cena</label>
                  <Input
                    type="number"
                    placeholder="Minimální cena"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="h-9"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Max. cena</label>
                  <Input
                    type="number"
                    placeholder="Maximální cena"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="h-9"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Řadit podle</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="h-9">
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
                <div className="flex items-end sm:col-span-2 lg:col-span-1">
                  <Button variant="outline" onClick={clearFilters} className="w-full h-9">
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
