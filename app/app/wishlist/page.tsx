
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, Trash2, ExternalLink, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface WishlistItem {
  id: string;
  createdAt: string;
  product: {
    id: string;
    name: string;
    price: number;
    salePrice?: number;
    currency: string;
    imageUrl?: string;
    brand?: string;
    originalUrl: string;
    category?: {
      name: string;
    };
    affiliateProgram: {
      baseUrl: string;
    };
  };
}

export default function WishlistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    fetchWishlist();
  }, [session, status, router]);

  const fetchWishlist = async () => {
    try {
      const response = await fetch('/api/wishlist');
      if (response.ok) {
        const data = await response.json();
        setWishlistItems(data);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      const response = await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      });

      if (response.ok) {
        setWishlistItems(prev => prev.filter(item => item.product.id !== productId));
        toast({
          title: 'Removed from wishlist',
          description: 'Product has been removed from your wishlist'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove item from wishlist',
        variant: 'destructive'
      });
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: currency || 'CZK'
    }).format(price);
  };

  const generateAffiliateLink = (baseUrl: string, originalUrl: string) => {
    return `${baseUrl}&desturl=${encodeURIComponent(originalUrl)}`;
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <Heart className="h-8 w-8 mr-3 text-red-500" />
          My Wishlist
        </h1>
        <p className="text-muted-foreground">
          Keep track of products you're interested in
        </p>
      </div>

      {wishlistItems.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Your wishlist is empty</h3>
            <p className="text-muted-foreground mb-6">
              Start adding products you love to your wishlist
            </p>
            <Link href="/">
              <Button>Browse Products</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {wishlistItems.map((item) => {
            const affiliateLink = generateAffiliateLink(
              item.product.affiliateProgram.baseUrl,
              item.product.originalUrl
            );

            return (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <div className="relative w-32 h-32 bg-muted rounded-lg overflow-hidden">
                        {item.product.imageUrl ? (
                          <Image
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          {item.product.category && (
                            <p className="text-sm text-muted-foreground mb-1">
                              {item.product.category.name}
                            </p>
                          )}
                          {item.product.brand && (
                            <p className="text-sm font-medium text-primary mb-1">
                              {item.product.brand}
                            </p>
                          )}
                          <Link href={`/products/${item.product.id}`}>
                            <h3 className="text-lg font-semibold hover:text-primary transition-colors line-clamp-2">
                              {item.product.name}
                            </h3>
                          </Link>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromWishlist(item.product.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {item.product.salePrice && item.product.salePrice < item.product.price ? (
                            <>
                              <span className="text-xl font-bold text-red-600">
                                {formatPrice(item.product.salePrice, item.product.currency)}
                              </span>
                              <span className="text-lg text-muted-foreground line-through">
                                {formatPrice(item.product.price, item.product.currency)}
                              </span>
                            </>
                          ) : (
                            <span className="text-xl font-bold">
                              {formatPrice(item.product.price, item.product.currency)}
                            </span>
                          )}
                        </div>

                        <div className="flex space-x-3">
                          <Button
                            variant="outline"
                            onClick={() => window.open(affiliateLink, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Visit Store
                          </Button>
                          <Link href={`/products/${item.product.id}`}>
                            <Button>View Details</Button>
                          </Link>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mt-2">
                        Added on {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
