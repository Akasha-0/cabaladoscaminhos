'use client';

import * as React from 'react';

// TooltipProvider - provides context for tooltips (simplified without Radix)
function TooltipProvider({ children, ...props }: { children: React.ReactNode } & Record<string, unknown>) {
  return <>{children}</>;
}

// Tooltip - wrapper component
function Tooltip({ children, ...props }: { children: React.ReactNode } & Record<string, unknown>) {
  return <>{children}</>;
}

// TooltipTrigger - placeholder (not used in simple implementation)
function TooltipTrigger({ children, asChild, ...props }: { children?: React.ReactNode; asChild?: boolean } & Record<string, unknown>) {
  return <>{children}</>;
}

// TooltipContent - placeholder (not used in simple implementation)
function TooltipContent({ children, ...props }: { children?: React.ReactNode } & Record<string, unknown>) {
  return <>{children}</>;
}

// TooltipInfo - custom component with icon and hover behavior
interface TooltipInfoProps {
  children?: React.ReactNode;
  titulo: string;
  descricao: string;
  variante?: 'info' | 'ajuda';
}

function TooltipInfo({ 
  children, 
  titulo, 
  descricao, 
  variante = 'info' 
}: TooltipInfoProps) {
  const [show, setShow] = React.useState(false);

  return (
    <div className="relative inline-block">
      <span 
        className="cursor-help inline-flex items-center"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {children || (variante === 'info' ? (
          <span className="text-muted-foreground text-sm ml-1">ⓘ</span>
        ) : (
          <span className="text-muted-foreground text-sm ml-1">?</span>
        ))}
      </span>
      
      {show && (
        <div className="absolute z-50 w-64 p-3 bg-popover border border-border rounded-lg shadow-lg -top-2 left-full ml-2">
          <h4 className="font-medium text-sm text-primary mb-1">{titulo}</h4>
          <p className="text-xs text-muted-foreground">{descricao}</p>
          <div className="absolute -left-2 top-4 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-popover" />
        </div>
      )}
    </div>
  );
}