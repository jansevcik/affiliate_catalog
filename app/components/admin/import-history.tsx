
'use client';

import { useState, useEffect } from 'react';
import { FileText, CheckCircle, XCircle, Clock, AlertCircle, Trash2, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { useToast } from '../../hooks/use-toast';

interface ImportRecord {
  id: string;
  importDate: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  recordsProcessed: number;
  recordsSuccess: number;
  recordsError: number;
  errorLog?: string;
  fileName?: string;
  xmlFormat: 'GOOGLE_RSS' | 'SHOPTET';
  affiliateProgram: {
    name: string;
  };
}

export function ImportHistory() {
  const [imports, setImports] = useState<ImportRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImport, setSelectedImport] = useState<ImportRecord | null>(null);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchImportHistory();
  }, []);

  const fetchImportHistory = async () => {
    try {
      const response = await fetch('/api/affiliate/imports');
      if (response.ok) {
        const data = await response.json();
        setImports(data);
      } else {
        console.error('Failed to fetch import history');
      }
    } catch (error) {
      console.error('Error fetching import history:', error);
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
        return <Clock className="h-4 w-4 text-blue-600" />;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const cleanupStuckImports = async () => {
    setIsCleaningUp(true);
    try {
      const response = await fetch('/api/affiliate/imports', {
        method: 'DELETE'
      });
      
      if (response.ok) {
        const result = await response.json();
        toast({
          title: 'Cleanup Successful',
          description: result.message
        });
        fetchImportHistory(); // Refresh the list
      } else {
        toast({
          title: 'Cleanup Failed',
          description: 'Failed to cleanup stuck imports',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred during cleanup',
        variant: 'destructive'
      });
    } finally {
      setIsCleaningUp(false);
    }
  };

  const deleteImport = async (importId: string) => {
    try {
      const response = await fetch(`/api/affiliate/imports?importId=${importId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        toast({
          title: 'Import Deleted',
          description: 'Import record has been deleted successfully'
        });
        fetchImportHistory(); // Refresh the list
      } else {
        toast({
          title: 'Delete Failed',
          description: 'Failed to delete import record',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred while deleting import',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Import History</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={cleanupStuckImports} 
            disabled={isCleaningUp}
            className="flex items-center"
          >
            <RotateCcw className={`h-4 w-4 mr-2 ${isCleaningUp ? 'animate-spin' : ''}`} />
            {isCleaningUp ? 'Cleaning...' : 'Cleanup Stuck'}
          </Button>
          <Button variant="outline" onClick={fetchImportHistory}>
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              Loading import history...
            </div>
          ) : imports.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No import history found</p>
              <p className="text-sm mt-2">Import some products to see the history here</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>File</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Results</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {imports.map((importRecord) => (
                  <TableRow key={importRecord.id}>
                    <TableCell className="text-sm">
                      {formatDate(importRecord.importDate)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">{importRecord.fileName || 'N/A'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{importRecord.affiliateProgram.name}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {importRecord.xmlFormat.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(importRecord.status)}
                        <Badge variant={getStatusVariant(importRecord.status)}>
                          {importRecord.status.toLowerCase()}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex space-x-4">
                          <span className="text-green-600">✓ {importRecord.recordsSuccess}</span>
                          {importRecord.recordsError > 0 && (
                            <span className="text-red-600">✗ {importRecord.recordsError}</span>
                          )}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {importRecord.recordsProcessed} total
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {importRecord.errorLog && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                View Errors
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Import Errors</DialogTitle>
                              </DialogHeader>
                              <div className="max-h-96 overflow-y-auto">
                                <pre className="text-sm bg-muted p-4 rounded-md whitespace-pre-wrap">
                                  {importRecord.errorLog}
                                </pre>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                        
                        {(importRecord.status === 'PROCESSING' || importRecord.status === 'FAILED') && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => deleteImport(importRecord.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
