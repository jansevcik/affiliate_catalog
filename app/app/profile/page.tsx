
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { User, Mail, Calendar, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  createdAt: string;
  isAdmin: boolean;
  _count?: {
    wishlists: number;
  };
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    fetchProfile();
  }, [session, status, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setEditFirstName(data.firstName || '');
        setEditLastName(data.lastName || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: editFirstName,
          lastName: editLastName,
        }),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
        setIsEditing(false);
        toast({
          title: 'Profil aktualizován',
          description: 'Vaše změny byly úspěšně uloženy.',
        });
      } else {
        throw new Error('Chyba při ukládání profilu');
      }
    } catch (error) {
      toast({
        title: 'Chyba',
        description: 'Nepodařilo se uložit změny.',
        variant: 'destructive',
      });
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">Načítání...</div>
      </div>
    );
  }

  if (!session || !profile) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <User className="h-8 w-8 mr-3 text-primary" />
          Můj profil
        </h1>
        <p className="text-muted-foreground">
          Spravujte své osobní údaje a nastavení
        </p>
      </div>

      <div className="grid gap-6">
        {/* Základní informace */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Základní informace</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (isEditing) {
                    handleSaveProfile();
                  } else {
                    setIsEditing(true);
                  }
                }}
              >
                {isEditing ? 'Uložit' : 'Upravit'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Křestní jméno</Label>
                {isEditing ? (
                  <Input
                    id="firstName"
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    placeholder="Zadejte své křestní jméno"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.firstName || 'Nenastaveno'}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Příjmení</Label>
                {isEditing ? (
                  <Input
                    id="lastName"
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    placeholder="Zadejte své příjmení"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.lastName || 'Nenastaveno'}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.email}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  E-mail nelze změnit
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Účet vytvořen</Label>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{new Date(profile.createdAt).toLocaleDateString('cs-CZ')}</span>
              </div>
            </div>

            {profile.isAdmin && (
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center space-x-2">
                  <Settings className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    Administrátorský účet
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Máte přístup k administraci systému
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistiky */}
        <Card>
          <CardHeader>
            <CardTitle>Statistiky</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {profile._count?.wishlists || 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  Produktů v seznamu přání
                </div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {Math.floor((Date.now() - new Date(profile.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                </div>
                <div className="text-sm text-muted-foreground">
                  Dní s námi
                </div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {profile.isAdmin ? 'Admin' : 'Uživatel'}
                </div>
                <div className="text-sm text-muted-foreground">
                  Role v systému
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
