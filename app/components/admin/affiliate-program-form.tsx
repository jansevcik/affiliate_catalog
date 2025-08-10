
'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { useToast } from '../../hooks/use-toast';

interface AffiliateProgram {
  id: string;
  name: string;
  baseUrl: string;
  commissionRate: number;
  cookieDays: number;
  restrictions?: string;
  isActive: boolean;
  _count?: {
    products: number;
    productImports: number;
  };
}

interface AffiliateProgramFormProps {
  onProgramAdded: () => void;
}

export function AffiliateProgramForm({ onProgramAdded }: AffiliateProgramFormProps) {
  const [programs, setPrograms] = useState<AffiliateProgram[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProgram, setEditingProgram] = useState<AffiliateProgram | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    baseUrl: '',
    commissionRate: '',
    cookieDays: '',
    restrictions: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const response = await fetch('/api/affiliate-programs');
      if (response.ok) {
        const data = await response.json();
        setPrograms(data);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const payload = {
        ...(editingProgram && { id: editingProgram.id }),
        name: formData.name,
        baseUrl: formData.baseUrl,
        commissionRate: parseFloat(formData.commissionRate),
        cookieDays: parseInt(formData.cookieDays),
        restrictions: formData.restrictions || null
      };

      const response = await fetch('/api/affiliate-programs', {
        method: editingProgram ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast({
          title: 'Úspěch',
          description: editingProgram 
            ? 'Affiliate program byl úspěšně aktualizován'
            : 'Affiliate program byl úspěšně vytvořen'
        });
        
        resetForm();
        setShowForm(false);
        fetchPrograms();
        onProgramAdded();
      } else {
        const error = await response.json();
        toast({
          title: 'Chyba',
          description: error.error || `Nepodařilo se ${editingProgram ? 'aktualizovat' : 'vytvořit'} program`,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Chyba',
        description: 'Došlo k neočekávané chybě',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      baseUrl: '',
      commissionRate: '',
      cookieDays: '',
      restrictions: ''
    });
    setEditingProgram(null);
  };

  const openForm = (program?: AffiliateProgram) => {
    if (program) {
      setFormData({
        name: program.name,
        baseUrl: program.baseUrl,
        commissionRate: program.commissionRate.toString(),
        cookieDays: program.cookieDays.toString(),
        restrictions: program.restrictions || ''
      });
      setEditingProgram(program);
    } else {
      resetForm();
    }
    setShowForm(true);
  };

  const handleDelete = async (program: AffiliateProgram) => {
    if (!confirm(`Opravdu chcete smazat program "${program.name}"? ${program._count?.products ? 'Program bude pouze deaktivován, protože obsahuje produkty.' : 'Tato akce je nevratná.'}`)) {
      return;
    }

    try {
      const response = await fetch(`/api/affiliate-programs?id=${program.id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: 'Úspěch',
          description: result.message
        });
        fetchPrograms();
        onProgramAdded();
      } else {
        toast({
          title: 'Chyba',
          description: result.error || 'Nepodařilo se smazat program',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Chyba',
        description: 'Došlo k neočekávané chybě',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Affiliate programy</h2>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button onClick={() => openForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Přidat program
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingProgram ? 'Upravit' : 'Vytvořit'} affiliate program
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Název programu</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="např. Žilkahodinky.cz"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="baseUrl">Základní URL</Label>
                <Input
                  id="baseUrl"
                  value={formData.baseUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, baseUrl: e.target.value }))}
                  placeholder="https://ehub.cz/system/scripts/click.php?a_aid=8409eef7&a_bid=d1bc0dbb"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="commissionRate">Sazba provize (%)</Label>
                  <Input
                    id="commissionRate"
                    type="number"
                    step="0.01"
                    value={formData.commissionRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, commissionRate: e.target.value }))}
                    placeholder="6.40"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cookieDays">Platnost cookies (dní)</Label>
                  <Input
                    id="cookieDays"
                    type="number"
                    value={formData.cookieDays}
                    onChange={(e) => setFormData(prev => ({ ...prev, cookieDays: e.target.value }))}
                    placeholder="14"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="restrictions">Omezení (volitelné)</Label>
                <Textarea
                  id="restrictions"
                  value={formData.restrictions}
                  onChange={(e) => setFormData(prev => ({ ...prev, restrictions: e.target.value }))}
                  placeholder="Jakékoli speciální podmínky nebo omezení..."
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Zrušit
                </Button>
                <Button type="submit">
                  {editingProgram ? 'Aktualizovat' : 'Vytvořit'} program
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              Načítání programů...
            </div>
          ) : programs.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>Žádné affiliate programy nenalezeny</p>
              <p className="text-sm mt-2">Vytvořte svůj první program pro začátek importu produktů</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Program</TableHead>
                  <TableHead>Provize</TableHead>
                  <TableHead>Cookies</TableHead>
                  <TableHead>Produkty</TableHead>
                  <TableHead>Akce</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {programs.map((program) => (
                  <TableRow key={program.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{program.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          <span className="truncate max-w-xs">{program.baseUrl}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{program.commissionRate}%</TableCell>
                    <TableCell>{program.cookieDays} dní</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{program._count?.products || 0} produktů</div>
                        <div className="text-muted-foreground">
                          {program._count?.productImports || 0} importů
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openForm(program)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(program)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
