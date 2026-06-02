'use client';

import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { useUserProfileStore } from '@/lib/store/user-profile';
import { 
  calculateLifePath, 
  calculateExpression, 
  calculateSoulUrge, 
  calculatePersonality 
} from '@/lib/numerologia/calculos';
import { getInterpretacao } from '@/lib/numerologia/calculos';

/**
 * User data shape provided by UserContext
 */
export interface UserData {
  /** User's name for destiny/soul/personality calculations */
  nome?: string;
  /** Birth date in DD/MM/YYYY format */
  dataNascimento?: string;
  /** User's ruling Orixá */
  orixaRegente?: string;
  /** User's current Odu */
  odu?: string;
  /** Pre-calculated life path number */
  numeroVida?: number;
  /** Signo astrológico */
  signo?: string;
  /** Dominant sefirot */
  sefirotDominante?: string[];
}

/**
 * User data with calculated numerology values
 */
export interface UserDataWithNumerology extends UserData {
  lifePath: number | null;
  destiny: number | null;
  soulUrge: number | null;
  personality: number | null;
  /** Has any profile data */
  hasProfile: boolean;
}

/**
 * Numerology interpretation
 */
export interface NumerologyInterpretation {
  numero: number;
  titulo: string;
  esoterico: string;
  mensagem: string;
  element: string;
  planet: string;
  sefira: string;
}

/**
 * UserContext
 */
const UserContext = createContext<UserDataWithNumerology | null>(null);

/**
 * Provider props
 */
interface UserProviderProps {
  children: ReactNode;
  /** Optional initial user data (for testing or server-side hydration) */
  initialData?: Partial<UserData>;
}

/**
 * UserProvider component
 * Wraps the app to provide user data to all widgets via context
 */
export function UserProvider({ children, initialData }: UserProviderProps) {
  const store = useUserProfileStore();
  
  // Calculate numerology from store profile
// fallow-ignore-next-line complexity
  const userDataWithNumerology = useMemo<UserDataWithNumerology>(() => {
    const profile = store.profile;
    
    // Start with profile data or initial data
    const baseData: UserData = {
      nome: profile?.nome ?? initialData?.nome,
      dataNascimento: profile?.dataNascimento ?? initialData?.dataNascimento,
      orixaRegente: profile?.orixaRegente ?? initialData?.orixaRegente,
      odu: profile?.odu ?? initialData?.odu,
      numeroVida: profile?.numeroVida ?? initialData?.numeroVida,
      signo: profile?.signo ?? initialData?.signo,
      sefirotDominante: profile?.sefirotDominante ?? initialData?.sefirotDominante,
    };

    const hasProfile = !!(profile || initialData);

    // Calculate numerology
    let lifePath: number | null = baseData.numeroVida ?? null;
    let destiny: number | null = null;
    let soulUrge: number | null = null;
    let personality: number | null = null;

    // Calculate Life Path from birth date
    if (baseData.dataNascimento) {
      if (!lifePath) {
        lifePath = calculateLifePath(baseData.dataNascimento);
      }
    }

    // Calculate from name
    if (baseData.nome) {
      destiny = calculateExpression(baseData.nome);
      soulUrge = calculateSoulUrge(baseData.nome);
      personality = calculatePersonality(baseData.nome);
    }

    return {
      ...baseData,
      lifePath,
      destiny,
      soulUrge,
      personality,
      hasProfile,
    };
  }, [store.profile, initialData]);

  return (
    <UserContext.Provider value={userDataWithNumerology}>
      {children}
    </UserContext.Provider>
  );
}

/**
 * Hook to access user data from context
 * Must be used within UserProvider
 */
export function useUserContext(): UserDataWithNumerology {
  const context = useContext(UserContext);
  if (!context) {
    // Fallback for when context is not available
    return {
      nome: undefined,
      dataNascimento: undefined,
      orixaRegente: undefined,
      odu: undefined,
      numeroVida: undefined,
      signo: undefined,
      sefirotDominante: undefined,
      lifePath: null,
      destiny: null,
      soulUrge: null,
      personality: null,
      hasProfile: false,
    };
  }
  return context;
}

/**
 * Get numerology interpretation for a number
 */
export function getNumerologyInterpretation(numero: number | null): NumerologyInterpretation | null {
  if (numero === null) return null;
  const interpretacao = getInterpretacao(numero);
  if (!interpretacao) return null;
  return {
    numero: interpretacao.numero,
    titulo: interpretacao.nome,
    esoterico: interpretacao.forca,
    mensagem: interpretacao.significado,
    element: '',
    planet: '',
    sefira: interpretacao.sefirotRelacionado,
  };
}
