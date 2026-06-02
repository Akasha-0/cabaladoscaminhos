// fallow-ignore-file unused-file
export interface Avatar {
  id: string;
  url: string;
  alt: string;
}

export interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
}

export interface ProfileCustomization {
  avatar: Avatar | null;
  theme: Theme | null;
  displayName: string;
  bio: string;
}

export const defaultThemes: Theme[] = [
  {
    id: 'light',
    name: 'Light',
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#ec4899',
      background: '#ffffff',
      text: '#1f2937',
    },
  },
  {
    id: 'dark',
    name: 'Dark',
    colors: {
      primary: '#818cf8',
      secondary: '#a78bfa',
      accent: '#f472b6',
      background: '#111827',
      text: '#f9fafb',
    },
  },
  {
    id: 'mystic',
    name: 'Mystic',
    colors: {
      primary: '#c084fc',
      secondary: '#a855f7',
      accent: '#e879f9',
      background: '#1e1b4b',
      text: '#e0e7ff',
    },
  },
];

export const defaultAvatars: Avatar[] = [
  { id: '1', url: '/avatars/default-1.svg', alt: 'Avatar 1' },
  { id: '2', url: '/avatars/default-2.svg', alt: 'Avatar 2' },
  { id: '3', url: '/avatars/default-3.svg', alt: 'Avatar 3' },
  { id: '4', url: '/avatars/default-4.svg', alt: 'Avatar 4' },
  { id: '5', url: '/avatars/default-5.svg', alt: 'Avatar 5' },
];

export function customizeProfile(
  customization: Partial<ProfileCustomization>,
): ProfileCustomization {
  return {
    avatar: customization.avatar ?? null,
    theme: customization.theme ?? null,
    displayName: customization.displayName ?? '',
    bio: customization.bio ?? '',
  };
}

export function getThemeById(themeId: string): Theme | undefined {
  return defaultThemes.find((t) => t.id === themeId);
}

export function getAvatarById(avatarId: string): Avatar | undefined {
  return defaultAvatars.find((a) => a.id === avatarId);
}
