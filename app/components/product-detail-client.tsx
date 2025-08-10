
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { Heart, ExternalLink, Share2, ArrowLeft, Package, Tag, Info } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { useToast } from '../hooks/use-toast';
import Link from 'next/link';

interface ProductDetailProps {
  product: {
    id: string;
    name: string;
    description?: string;
    price: number;
    salePrice?: number;
    currency: string;
    imageUrl?: string;
    brand?: string;
    model?: string;
    sku?: string;
    ean?: string;
    availability?: string;
    condition?: string;
    affiliateLink: string;
    originalUrl: string;
    category?: {
      id: string;
      name: string;
    };
    affiliateProgram: {
      id: string;
      name: string;
      commissionRate: number;
    };
    attributes: Array<{
      id: string;
      name: string;
      value: string;
    }>;
  };
}

export function ProductDetailClient({ product }: ProductDetailProps) {
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
        title: "Přihlášení požadováno",
        description: "Prosím přihlaste se pro přidání produktů do seznamu přání",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/wishlist', {
        method: isWishlisted ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id })
      });

      if (response.ok) {
        setIsWishlisted(!isWishlisted);
        toast({
          title: isWishlisted ? "Odebráno ze seznamu přání" : "Přidáno do seznamu přání",
          description: `${product.name} ${isWishlisted ? 'byl odebrán ze' : 'byl přidán do'} vašeho seznamu přání`
        });
      }
    } catch (error) {
      toast({
        title: "Chyba",
        description: "Nepodařilo se aktualizovat seznam přání",
        variant: "destructive"
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out this product: ${product.name}`,
          url: window.location.href
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to copying URL
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Odkaz zkopírován",
          description: "Odkaz na produkt byl zkopírován do schránky"
        });
      } catch (error) {
        toast({
          title: "Sdílení se nezdařilo",
          description: "Nelze sdílet tento produkt",
          variant: "destructive"
        });
      }
    }
  };

  const handleAffiliateClick = () => {
    window.open(product.affiliateLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zpět na produkty
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
            {product.imageUrl && !imageError ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                onError={() => setImageError(true)}
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-muted flex items-center justify-center">
                <Package className="h-24 w-24 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>

        {/* Product Information */}
        <div className="space-y-6">
          {/* Category and Brand */}
          <div className="space-y-2">
            {product.category && (
              <Badge variant="secondary">{product.category.name}</Badge>
            )}
            {product.brand && (
              <p className="text-lg font-semibold text-primary">{product.brand}</p>
            )}
          </div>

          {/* Product Name */}
          <h1 className="text-3xl font-bold">{product.name}</h1>

          {/* Price */}
          <div className="space-y-2">
            <div className="flex items-center space-x-4">
              {product.salePrice && product.salePrice < product.price ? (
                <>
                  <span className="text-3xl font-bold text-red-600">
                    {formatPrice(product.salePrice, product.currency)}
                  </span>
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(product.price, product.currency)}
                  </span>
                  <Badge variant="destructive">
                    -{Math.round(((product.price - product.salePrice) / product.price) * 100)}%
                  </Badge>
                </>
              ) : (
                <span className="text-3xl font-bold">
                  {formatPrice(product.price, product.currency)}
                </span>
              )}
            </div>
            
            {product.availability && (
              <div className="flex items-center space-x-2">
                <Badge 
                  variant={product.availability === 'in stock' ? 'default' : 'secondary'}
                >
                  {product.availability}
                </Badge>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <Button 
              onClick={handleAffiliateClick}
              size="lg"
              className="flex-1"
            >
              <ExternalLink className="h-5 w-5 mr-2" />
              Navštívit obchod
            </Button>
            
            {session && (
              <Button 
                variant="outline" 
                size="lg"
                onClick={handleWishlistToggle}
              >
                <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
            )}
            
            <Button variant="outline" size="lg" onClick={handleShare}>
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          {/* Affiliate Program Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Prodáváno přes {product.affiliateProgram.name}</span>
                {session?.user?.isAdmin && (
                  <span>{product.affiliateProgram.commissionRate}% provize</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          {product.description && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center">
                <Info className="h-5 w-5 mr-2" />
                Popis
              </h2>
              <Card>
                <CardContent className="pt-6">
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Product Attributes */}
      {product.attributes.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <Tag className="h-5 w-5 mr-2" />
            Specifikace
          </h2>
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.attributes.map((attr, index) => (
                  <div key={attr.id} className="flex justify-between py-2">
                    <span className="font-medium">{attr.name}:</span>
                    <span className="text-muted-foreground">{attr.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Additional Product Info */}
      {(product.sku || product.ean || product.model) && (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Detaily produktu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {product.sku && (
                  <div>
                    <span className="font-medium">SKU:</span>
                    <p className="text-muted-foreground">{product.sku}</p>
                  </div>
                )}
                {product.ean && (
                  <div>
                    <span className="font-medium">EAN:</span>
                    <p className="text-muted-foreground">{product.ean}</p>
                  </div>
                )}
                {product.model && (
                  <div>
                    <span className="font-medium">Model:</span>
                    <p className="text-muted-foreground">{product.model}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
