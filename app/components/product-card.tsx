
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Heart, ExternalLink, ShoppingCart } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useToast } from '../hooks/use-toast';

interface ProductCardProps {
  product: {
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
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: currency || 'CZK'
    }).format(price);
  };

  const handleWishlistToggle = async () => {
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add products to your wishlist",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/wishlist', {
        method: isWishlisted ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId: product.id })
      });

      if (response.ok) {
        setIsWishlisted(!isWishlisted);
        toast({
          title: isWishlisted ? "Removed from wishlist" : "Added to wishlist",
          description: `${product.name} ${isWishlisted ? 'removed from' : 'added to'} your wishlist`
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update wishlist",
        variant: "destructive"
      });
    }
  };

  const handleAffiliateClick = () => {
    // Track affiliate click if needed
    window.open(product.affiliateLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <CardContent className="p-0">
        {/* Product Image */}
        <div className="relative aspect-square bg-muted">
          {product.imageUrl && !imageError ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="absolute inset-0 bg-muted flex items-center justify-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          
          {/* Wishlist Button */}
          {session && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-background/80 hover:bg-background"
              onClick={handleWishlistToggle}
            >
              <Heart 
                className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} 
              />
            </Button>
          )}

          {/* Availability Badge */}
          {product.availability && (
            <Badge 
              variant={product.availability === 'in stock' ? 'default' : 'secondary'}
              className="absolute bottom-2 left-2"
            >
              {product.availability}
            </Badge>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Category */}
          {product.category && (
            <p className="text-xs text-muted-foreground mb-1">
              {product.category.name}
            </p>
          )}

          {/* Brand */}
          {product.brand && (
            <p className="text-sm font-medium text-primary mb-1">
              {product.brand}
            </p>
          )}

          {/* Product Name */}
          <Link href={`/products/${product.id}`}>
            <h3 className="font-semibold text-sm mb-2 line-clamp-2 hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Price */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              {product.salePrice && product.salePrice < product.price ? (
                <>
                  <span className="text-lg font-bold text-red-600">
                    {formatPrice(product.salePrice, product.currency)}
                  </span>
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(product.price, product.currency)}
                  </span>
                </>
              ) : (
                <span className="text-lg font-bold">
                  {formatPrice(product.price, product.currency)}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button 
              onClick={handleAffiliateClick}
              className="flex-1"
              size="sm"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Visit Store
            </Button>
            <Link href={`/products/${product.id}`}>
              <Button variant="outline" size="sm">
                Details
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
