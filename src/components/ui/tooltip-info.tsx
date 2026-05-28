'use client';

import { useState } from 'react';
import { Info, HelpCircle } from 'lucide-react';

interface TooltipInfoProps {
  children?: React.ReactNode;
  titulo: string;
  descricao: string;
  variante?: 'info' | 'ajuda';
}

export function TooltipInfo({ 
  children, 
  titulo, 
  descricao, 
  variante = 'info' 
}: TooltipInfoProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-block">
      <span 
        className="cursor-help inline-flex items-center"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {children || (variante === 'info' ? (
          <Info className="w-4 h-4 text-muted-foreground inline ml-1" />
        ) : (
          <HelpCircle className="w-4 h-4 text-muted-foreground inline ml-1" />
        ))}
      </span>
      
      {show && (
        <div className="absolute z-50 w-64 p-3 bg-popover border border-border rounded-lg shadow-lg -top-2 left-full ml-2">
          <h4 className="font-medium text-sm text-primary mb-1">{titulo}</h4>
          <p className="text-xs text-muted-foreground font-raleway">{descricao}</p>
          <div className="absolute -left-2 top-4 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-popover" />
        </div>
      )}
    </div>
  );
}
