
'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Folder, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface Category {
  id: string;
  name: string;
  slug: string;
  children?: Category[];
  _count?: {
    products: number;
  };
}

interface CategorySidebarProps {
  onCategorySelect: (categoryId: string | null) => void;
  selectedCategoryId: string | null;
}

export function CategorySidebar({ onCategorySelect, selectedCategoryId }: CategorySidebarProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories?tree=true');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const renderCategory = (category: Category, level: number = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const isSelected = selectedCategoryId === category.id;
    const paddingLeft = level * 16 + 8;

    return (
      <div key={category.id}>
        <div className="flex items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isSelected ? "secondary" : "ghost"}
                  className="w-full justify-start text-left h-auto py-2 px-2"
                  style={{ paddingLeft: `${paddingLeft}px` }}
                  onClick={() => onCategorySelect(isSelected ? null : category.id)}
                >
                  <div className="flex items-center flex-1 min-w-0">
                    {hasChildren && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpanded(category.id);
                        }}
                        className="flex-shrink-0 p-1 -ml-1 mr-1"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-3 w-3" />
                        ) : (
                          <ChevronRight className="h-3 w-3" />
                        )}
                      </button>
                    )}
                    <Folder className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate text-sm">{category.name}</span>
                    {category._count?.products !== undefined && (
                      <span className="ml-auto text-xs text-muted-foreground flex-shrink-0">
                        ({category._count.products})
                      </span>
                    )}
                  </div>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{category.name}</p>
                {category._count?.products !== undefined && (
                  <p className="text-xs">{category._count.products} produktů</p>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {hasChildren && isExpanded && (
          <div>
            {category.children!.map((child) => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={`${isExpanded ? 'w-96' : 'w-64'} bg-muted/20 p-4 transition-all duration-300`}>
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`${isExpanded ? 'w-96' : 'w-64'} bg-muted/20 border-r transition-all duration-300`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Kategorie</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8"
          >
            {isExpanded ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
        <Button
          variant={selectedCategoryId === null ? "secondary" : "ghost"}
          className="w-full justify-start mb-2"
          onClick={() => onCategorySelect(null)}
        >
          Všechny produkty
        </Button>
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-1">
            {categories.map((category) => renderCategory(category))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
