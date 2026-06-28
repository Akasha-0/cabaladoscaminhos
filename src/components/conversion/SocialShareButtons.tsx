'use client';

// ============================================================================
// SocialShareButtons — Botões de compartilhamento com copy pré-preenchido
// ============================================================================
// Suporta: Twitter, LinkedIn, WhatsApp, copy link.
// Cada plataforma recebe copy otimizado + URL com `?ref=<userId>` quando
// aplicável (tracking de referral).
// ============================================================================

import { useState } from 'react';
import { Bird, MessageCircle, Link as LinkIcon, Check } from 'lucide-react';
import { trackEvent } from '@/lib/analytics/events-catalog';

interface Props {
  url: string;
  title: string;
  variant: 'A' | 'B' | 'C' | 'D';
}

export function SocialShareButtons({ url, title, variant }: Props) {
  const [copied, setCopied] = useState(false);

  // Anexa ?ref=userId se houver (tracking de referral)
  const refUrl = (() => {
    if (typeof window === 'undefined') return url;
    const userId = window.localStorage?.getItem('userId');
    if (!userId) return url;
    try {
      const u = new URL(url);
      u.searchParams.set('ref', userId);
      return u.toString();
    } catch {
      return url;
    }
  })();

  const trackShare = (channel: 'twitter' | 'linkedin' | 'whatsapp' | 'copy_link') => {
    trackEvent('page_viewed', {
      path: '/social-share',
      query: { variant, channel },
    });
  };

  const handleTwitter = () => {
    const text = encodeURIComponent(title);
    const u = encodeURIComponent(refUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${u}`, '_blank', 'noopener');
    trackShare('twitter');
  };

  const handleLinkedIn = () => {
    const u = encodeURIComponent(refUrl);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${u}`, '_blank', 'noopener');
    trackShare('linkedin');
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`${title}\n\n${refUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener');
    trackShare('whatsapp');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(refUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      trackShare('copy_link');
    } catch {
      /* fallback: prompt */
      window.prompt('Copie o link:', refUrl);
    }
  };

  const buttons = [
    {
      id: 'twitter',
      label: 'Twitter',
      icon: Bird,
      onClick: handleTwitter,
      className: 'hover:bg-sky-500/20 hover:text-sky-300 hover:border-sky-500/40',
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      icon: LinkIcon,
      onClick: handleLinkedIn,
      className: 'hover:bg-blue-500/20 hover:text-blue-300 hover:border-blue-500/40',
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: MessageCircle,
      onClick: handleWhatsApp,
      className: 'hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/40',
    },
    {
      id: 'copy',
      label: copied ? 'Copiado!' : 'Copiar link',
      icon: copied ? Check : LinkIcon,
      onClick: handleCopy,
      className:
        copied
          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
          : 'hover:bg-slate-500/20 hover:text-slate-200 hover:border-slate-500/40',
    },
  ];

  return (
    <div>
      <p className="text-xs text-slate-400 mb-3">Compartilhe:</p>
      <div className="flex flex-wrap gap-2">
        {buttons.map((b) => {
          const Icon = b.icon;
          return (
            <button
              key={b.id}
              type="button"
              onClick={b.onClick}
              aria-label={b.label}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/50 border border-slate-700/60 text-xs text-slate-300 transition ${b.className}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {b.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
