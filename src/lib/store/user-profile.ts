import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SpiritualProfile {
  id: string;
  nome: string;
  email: string;
  dataNascimento?: string;
  numeroVida?: number;
  odu?: string;
  signo?: string;
  orixaRegente?: string;
  sefirotDominante?: string[];
}

interface UserProfileStore {
  profile: SpiritualProfile | null;
  isLoading: boolean;
  setProfile: (profile: SpiritualProfile) => void;
  updateProfile: (data: Partial<SpiritualProfile>) => void;
  clearProfile: () => void;
}

export const useUserProfileStore = create<UserProfileStore>()(
  persist(
    (set) => ({
      profile: null,
      isLoading: false,
      setProfile: (profile) => set({ profile }),
      updateProfile: (data) => set((state) => ({
        profile: state.profile ? { ...state.profile, ...data } : null,
      })),
      clearProfile: () => set({ profile: null }),
    }),
    { name: 'spiritual-profile' }
  )
);