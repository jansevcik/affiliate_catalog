

'use client';

import { useState } from 'react';
import { Header } from './header';

interface LayoutContentProps {
  children: React.ReactNode;
}

export function LayoutContent({ children }: LayoutContentProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Emit custom event for homepage to listen
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('searchQuery', { detail: query }));
    }
  };

  return (
    <>
      <Header onSearch={handleSearch} />
      <main>{children}</main>
    </>
  );
}
