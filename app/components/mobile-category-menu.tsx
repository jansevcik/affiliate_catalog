
'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { CategorySidebar } from './category-sidebar';

interface MobileCategoryMenuProps {
  selectedCategory?: string;
  onCategoryChange: (categoryId?: string) => void;
}

export function MobileCategoryMenu({ selectedCategory, onCategoryChange }: MobileCategoryMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleCategorySelect = (categoryId: string | null) => {
    onCategoryChange(categoryId || undefined);
    setIsOpen(false);
  };

  return (
    <div className="md:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="mb-4">
            <Menu className="h-4 w-4 mr-2" />
            Kategorie
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] sm:w-[350px]">
          <SheetHeader>
            <SheetTitle>Kategorie produktů</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <CategorySidebar 
              selectedCategoryId={selectedCategory || null}
              onCategorySelect={handleCategorySelect}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
