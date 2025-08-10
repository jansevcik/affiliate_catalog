
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Upload, Plus, Settings, FileText, Package, TrendingUp, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { XmlImportForm } from '@/components/admin/xml-import-form';
import { AffiliateProgramForm } from '@/components/admin/affiliate-program-form';
import { ImportHistory } from '@/components/admin/import-history';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalPrograms: 0,
    totalImports: 0,
    recentImports: 0
  });

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin?callbackUrl=' + encodeURIComponent('/admin'));
      return;
    }
    
    if (!session?.user?.isAdmin) {
      router.push('/');
      return;
    }

    fetchStats();
  }, [session, status, router]);

  const fetchStats = async () => {
    try {
      // This would normally be a dedicated stats endpoint
      const [productsRes, programsRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/affiliate-programs')
      ]);

      if (productsRes.ok && programsRes.ok) {
        const productsData = await productsRes.json();
        const programsData = await programsRes.json();
        
        setStats({
          totalProducts: productsData.pagination?.total || 0,
          totalPrograms: programsData.length || 0,
          totalImports: 0,
          recentImports: 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Načítá se...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Přihlášení požadováno</h2>
          <p className="text-muted-foreground mb-4">Pro přístup k admin panelu se musíte přihlásit</p>
          <Button onClick={() => router.push('/auth/signin?callbackUrl=' + encodeURIComponent('/admin'))}>
            Přihlásit se
          </Button>
        </div>
      </div>
    );
  }

  if (!session?.user?.isAdmin) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold mb-2">Přístup odepřen</h2>
          <p className="text-muted-foreground mb-4">Nemáte oprávnění pro přístup k admin panelu</p>
          <Button onClick={() => router.push('/')}>
            Zpět na hlavní stránku
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage affiliate programs, import products, and monitor system performance
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Affiliate Programs</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPrograms}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Imports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalImports}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Imports</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentImports}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="import" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="import">XML Import</TabsTrigger>
          <TabsTrigger value="programs">Affiliate Programs</TabsTrigger>
          <TabsTrigger value="history">Import History</TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="mt-6">
          <XmlImportForm onImportComplete={fetchStats} />
        </TabsContent>

        <TabsContent value="programs" className="mt-6">
          <AffiliateProgramForm onProgramAdded={fetchStats} />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <ImportHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}
