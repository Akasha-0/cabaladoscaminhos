'use client';

// fallow-ignore-next-line unresolved-import
import { useUserProfileStore } from '@/lib/store/user-profile'
import { Card, CardContent } from '@/components/ui/card';
import { User, Crown, Star } from 'lucide-react';

export function UserProfileBadge() {
  const { profile } = useUserProfileStore();
  
  if (!profile) return null;
  
  return (
    <Card className="card-spiritual">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
            <User className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <p className="font-medium">{profile.nome || 'Visitante'}</p>
            <p className="text-sm text-slate-400">{profile.email}</p>
          </div>
        </div>
        
        {(profile.numeroVida || profile.orixaRegente) && (
          <div className="mt-4 flex gap-3">
            {profile.numeroVida && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10">
                <Crown className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium">Vida {profile.numeroVida}</span>
              </div>
            )}
            {profile.orixaRegente && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800">
                <Star className="w-4 h-4 text-amber-400" />
                <span className="text-sm">{profile.orixaRegente}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}