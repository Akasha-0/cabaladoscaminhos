'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers/SupabaseProvider';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Moon, 
  BookOpen, 
  Star,
  Calendar,
  User,
  LogOut,
  Sparkles,
  Hexagon
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/(dashboard)', label: 'Início', icon: Sparkles },
  { href: '/(dashboard)/calendario', label: 'Calendário', icon: Calendar },
  { href: '/(dashboard)/chat', label: 'Práticas', icon: Moon },
  { href: '/(dashboard)/perfil', label: 'Perfil', icon: User },
];

export function DashboardNav() {
  const pathname = usePathname();
  const { signOut, user } = useAuth();

  return (
    <div className="w-64 min-h-screen bg-sidebar flex flex-col border-r border-sidebar-border">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
            <Hexagon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-cinzel text-primary tracking-wider">
              CABALA
            </h1>
            <p className="text-[10px] text-muted-foreground font-raleway">
              dos Caminhos
            </p>
          </div>
        </div>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={`w-full justify-start gap-3 h-11 font-raleway transition-all ${
                    isActive 
                      ? 'bg-primary/20 text-primary border border-primary/30' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        <Separator className="my-4 bg-sidebar-border" />

        {/* Spiritual Quick Links */}
        <div className="px-2 space-y-1">
          <p className="text-[10px] uppercase text-muted-foreground tracking-wider mb-2 px-2">
            Ferramentas Espirituais
          </p>
          <Link href="/(dashboard)/calendario">
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2 h-9 text-xs font-raleway text-muted-foreground hover:text-foreground">
              <Moon className="w-3 h-3" />
              Diário Espiritual
            </Button>
          </Link>
          <Link href="/(dashboard)/calendario">
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2 h-9 text-xs font-raleway text-muted-foreground hover:text-foreground">
              <BookOpen className="w-3 h-3" />
              Odús do Dia
            </Button>
          </Link>
          <Link href="/(dashboard)/calendario">
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2 h-9 text-xs font-raleway text-muted-foreground hover:text-foreground">
              <Star className="w-3 h-3" />
              Orixás
            </Button>
          </Link>
        </div>
      </ScrollArea>

      <Separator className="bg-sidebar-border" />

      {/* User Section */}
      <div className="p-4 space-y-3">
        <div className="px-2 space-y-1">
          <p className="text-xs text-muted-foreground font-raleway truncate">
            {user?.email || 'Conectado'}
          </p>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive font-raleway"
          onClick={() => signOut()}
        >
          <LogOut className="w-4 h-4" />
          Sair
        </Button>
      </div>
    </div>
  );
}
