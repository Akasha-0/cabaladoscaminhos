import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserPreferences {
  tema: 'mystical' | 'minimal' | 'cosmic';
  notifications: boolean;
  quizilas: string[];
  orixaFavorito: string | null;
  setTema: (tema: 'mystical' | 'minimal' | 'cosmic') => void;
  setNotifications: (enabled: boolean) => void;
  addQuizila: (quizila: string) => void;
  removeQuizila: (quizila: string) => void;
  setOrixaFavorito: (orixa: string | null) => void;
  clearQuizilas: () => void;
}

export const useUserPreferences = create<UserPreferences>()(
  persist(
    (set) => ({
      tema: 'mystical',
      notifications: true,
      quizilas: [],
      orixaFavorito: null,
      setTema: (tema) => set({ tema }),
      setNotifications: (notifications) => set({ notifications }),
      addQuizila: (quizila) => set((state) => ({
        quizilas: [...new Set([...state.quizilas, quizila])]
      })),
      removeQuizila: (quizila) => set((state) => ({
        quizilas: state.quizilas.filter(q => q !== quizila)
      })),
      setOrixaFavorito: (orixaFavorito) => set({ orixaFavorito }),
      clearQuizilas: () => set({ quizilas: [] }),
    }),
    {
      name: 'user-preferences',
    }
  )
);