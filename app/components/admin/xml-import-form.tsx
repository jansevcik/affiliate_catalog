
'use client';

import { useState, useEffect } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { useToast } from '../../hooks/use-toast';

interface AffiliateProgram {
  id: string;
  name: string;
  baseUrl: string;
}

interface XmlImportFormProps {
  onImportComplete: () => void;
}

export function XmlImportForm({ onImportComplete }: XmlImportFormProps) {
  const [affiliatePrograms, setAffiliatePrograms] = useState<AffiliateProgram[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<'GOOGLE_RSS' | 'SHOPTET'>('GOOGLE_RSS');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [lastImportResult, setLastImportResult] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchAffiliatePrograms();
  }, []);

  const fetchAffiliatePrograms = async () => {
    try {
      const response = await fetch('/api/affiliate-programs');
      if (response.ok) {
        const programs = await response.json();
        setAffiliatePrograms(programs);
      }
    } catch (error) {
      console.error('Error fetching affiliate programs:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/xml') {
      setFile(selectedFile);
    } else {
      toast({
        title: 'Invalid File',
        description: 'Please select a valid XML file',
        variant: 'destructive'
      });
    }
  };

  const handleUpload = async () => {
    if (!file || !selectedProgramId || !selectedFormat) {
      toast({
        title: 'Missing Information',
        description: 'Please select a file, affiliate program, and XML format',
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('xmlFile', file);
      formData.append('affiliateProgramId', selectedProgramId);
      formData.append('xmlFormat', selectedFormat);

      const response = await fetch('/api/affiliate/import', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        setLastImportResult(result);
        toast({
          title: 'Import Successful',
          description: `Imported ${result.summary.successfulImports} products successfully`
        });
        onImportComplete();
        
        // Reset form
        setFile(null);
        setSelectedProgramId('');
        const fileInput = document.getElementById('xml-file') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        toast({
          title: 'Import Failed',
          description: result.error || 'Failed to import XML file',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Upload Error',
        description: 'An error occurred during upload',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            XML Product Import
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Affiliate Program Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Affiliate Program</label>
            <Select value={selectedProgramId} onValueChange={setSelectedProgramId}>
              <SelectTrigger>
                <SelectValue placeholder="Select affiliate program" />
              </SelectTrigger>
              <SelectContent>
                {affiliatePrograms.map((program) => (
                  <SelectItem key={program.id} value={program.id}>
                    {program.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* XML Format Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">XML Format</label>
            <Select value={selectedFormat} onValueChange={(value: any) => setSelectedFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GOOGLE_RSS">Google RSS (g: namespace)</SelectItem>
                <SelectItem value="SHOPTET">Shoptet (SHOPITEM structure)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium">XML File</label>
            <div className="flex items-center space-x-4">
              <input
                id="xml-file"
                type="file"
                accept=".xml"
                onChange={handleFileChange}
                className="flex-1 text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
              {file && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <FileText className="h-4 w-4 mr-1" />
                  {file.name}
                </div>
              )}
            </div>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Importing products...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          {/* Upload Button */}
          <Button 
            onClick={handleUpload} 
            disabled={!file || !selectedProgramId || isUploading}
            className="w-full"
          >
            {isUploading ? 'Importing...' : 'Import Products'}
          </Button>
        </CardContent>
      </Card>

      {/* Last Import Result */}
      {lastImportResult && (
        <Card>
          <CardHeader>
            <CardTitle>Last Import Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {lastImportResult.summary.successfulImports}
                </div>
                <div className="text-sm text-muted-foreground">Successful</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {lastImportResult.summary.errors}
                </div>
                <div className="text-sm text-muted-foreground">Errors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {lastImportResult.summary.totalRecords}
                </div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
            </div>

            {lastImportResult.summary.errorDetails?.length > 0 && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-medium">Import Errors:</p>
                    {lastImportResult.summary.errorDetails.slice(0, 5).map((error: string, index: number) => (
                      <p key={index} className="text-sm">{error}</p>
                    ))}
                    {lastImportResult.summary.errorDetails.length > 5 && (
                      <p className="text-sm text-muted-foreground">
                        ...and {lastImportResult.summary.errorDetails.length - 5} more errors
                      </p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
