'use client';

import { useMemo } from 'react';
// fallow-ignore-next-line unresolved-import
import { useUserProfileStore } from '@/lib/store/user-profile'
import { 
  calculateLifePath, 
  calculateExpression, 
  calculateSoulUrge, 
  calculatePersonality,
  getInterpretacao 
} from '@/lib/numerologia/calculos';

/**
 * User data for widgets
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
}

/**
 * Extended user data with calculated numerology
 */
export interface UserDataWithNumerology extends UserData {
  lifePath: number | null;
  destiny: number | null;
  soulUrge: number | null;
  personality: number | null;
}

/**
 * Hook to access user profile data
 * Connects the Zustand store to widgets with calculated numerology
 */
export function useUserProfile(): UserDataWithNumerology {
  const profile = useUserProfileStore((state) => state.profile);

  const userData = useMemo<UserDataWithNumerology>(() => {
    if (!profile) {
      return {
        nome: undefined,
        dataNascimento: undefined,
        orixaRegente: undefined,
        odu: undefined,
        numeroVida: undefined,
        lifePath: null,
        destiny: null,
        soulUrge: null,
        personality: null,
      };
    }

    // Extract user data from profile
    const userData: UserData = {
      nome: profile.nome,
      dataNascimento: profile.dataNascimento,
      orixaRegente: profile.orixaRegente,
      odu: profile.odu,
      numeroVida: profile.numeroVida,
    };

    // Calculate numerology if birth date and name are available
    let lifePath: number | null = profile.numeroVida ?? null;
    let destiny: number | null = null;
    let soulUrge: number | null = null;
    let personality: number | null = null;

    if (profile.dataNascimento) {
      // Life Path from birth date
      if (!lifePath) {
        lifePath = calculateLifePath(profile.dataNascimento);
      }
    }

    if (profile.nome) {
      // Destiny number from full name
      destiny = calculateExpression(profile.nome);
      // Soul Urge from name vowels
      soulUrge = calculateSoulUrge(profile.nome);
      // Personality from name consonants
      personality = calculatePersonality(profile.nome);
    }

    return {
      ...userData,
      lifePath,
      destiny,
      soulUrge,
      personality,
    };
  }, [profile]);

  return userData;
}

/**
 * Check if user has profile data
 */
export function useHasUserProfile(): boolean {
  const profile = useUserProfileStore((state) => state.profile);
  return profile !== null;
}

/**
 * Get numerology interpretation for a number
 */
export function useNumerologyInterpretation(numero: number | null) {
  return useMemo(() => {
    if (numero === null) return null;
    return getInterpretacao(numero);
  }, [numero]);
}
