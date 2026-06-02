// Stub for missing module
import { create } from 'zustand';

interface UserProfileState {
  profile: Record<string, unknown> | null;
  setProfile: (profile: Record<string, unknown>) => void;
}

export const useUserProfileStore = create<UserProfileState>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
}));

export interface UserProfile {
  id: string;
  nome?: string;
  dataNascimento?: string;
  orixaRegente?: string;
  odu?: string;
  numeroVida?: number;
}