
'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, XCircle, RotateCcw } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';

interface ImportStatus {
  id: string;
  importDate: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  recordsProcessed: number;
  recordsSuccess: number;
  recordsError: number;
  fileName?: string;
  affiliateProgram: {
    name: string;
  };
}

export function ImportStatusBanner() {
  const [imports, setImports] = useState<ImportStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    fetchImports();
    const interval = setInterval(fetchImports, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchImports = async () => {
    try {
      const response = await fetch('/api/affiliate/imports');
      if (response.ok) {
        const data = await response.json();
        // Show only the last 5 imports
        setImports(data.slice(0, 5));
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error fetching imports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'PROCESSING':
        return <Clock className="h-4 w-4 text-blue-600 animate-pulse" />;
      case 'PENDING':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'COMPLETED':
        return 'default';
      case 'FAILED':
        return 'destructive';
      case 'PROCESSING':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const processingImports = imports.filter(imp => imp.status === 'PROCESSING');
  const failedImports = imports.filter(imp => imp.status === 'FAILED');
  const hasIssues = processingImports.length > 0 || failedImports.length > 0;

  if (isLoading || imports.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 space-y-4">
      {/* Issues Alert */}
      {hasIssues && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <div className="flex items-center justify-between">
              <div>
                {processingImports.length > 0 && (
                  <span className="mr-4">
                    {processingImports.length} import{processingImports.length > 1 ? 'y' : ''} stále probíha{processingImports.length > 1 ? 'jí' : ''}
                  </span>
                )}
                {failedImports.length > 0 && (
                  <span>
                    {failedImports.length} import{failedImports.length > 1 ? 'y' : ''} selhal{failedImports.length > 1 ? 'y' : ''}
                  </span>
                )}
              </div>
              <Button
                variant="ghost" 
                size="sm" 
                onClick={() => window.location.href = '/admin'}
                className="text-orange-700 hover:text-orange-800"
              >
                Zobrazit detaily
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Recent Imports Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Nedávné importy</h3>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>Aktualizováno: {lastUpdate.toLocaleTimeString('cs-CZ')}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchImports}
                className="p-1 h-auto"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {imports.map((importRecord) => (
              <div key={importRecord.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(importRecord.status)}
                  <div>
                    <div className="font-medium text-sm">
                      {importRecord.affiliateProgram.name} - {importRecord.fileName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(importRecord.importDate).toLocaleString('cs-CZ')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Badge variant={getStatusVariant(importRecord.status)} className="text-xs">
                    {importRecord.status.toLowerCase()}
                  </Badge>
                  
                  {importRecord.recordsProcessed > 0 && (
                    <div className="text-xs text-muted-foreground">
                      <span className="text-green-600">✓ {importRecord.recordsSuccess}</span>
                      {importRecord.recordsError > 0 && (
                        <span className="ml-2 text-red-600">✗ {importRecord.recordsError}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {imports.length === 5 && (
            <div className="mt-4 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/admin'}
                className="text-muted-foreground hover:text-foreground"
              >
                Zobrazit všechny importy →
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
