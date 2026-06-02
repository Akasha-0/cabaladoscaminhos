// fallow-ignore-file unused-file
// Profile data - skipped linting and formatting

export interface ProfileData {
  id: string;
  nomeCompleto: string;
  dataNascimento: string;
  horaNascimento?: string;
  localNascimento?: string;
  genero?: string;
  email?: string;
  telefone?: string;
  idioma?: string;
  fusoHorario?: string;
  biografia?: string;
  orixa?: string;
  caminho?: string;
  caminhoCor?: string;
  createdAt: number;
  updatedAt: number;
}

const PROFILE_DATA: ProfileData[] = [
  {
    id: 'default',
    nomeCompleto: '',
    dataNascimento: '',
    genero: undefined,
    idioma: 'pt-BR',
    fusoHorario: 'America/Sao_Paulo',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

/**
 * Retrieve the profile data.
 */
export function getProfile(id?: string): ProfileData | undefined {
  if (!id) {
    return PROFILE_DATA[0];
  }
  return PROFILE_DATA.find((p) => p.id === id);
}

/**
 * Update profile data.
 */
export function updateProfile(id: string, data: Partial<ProfileData>): ProfileData | undefined {
  const index = PROFILE_DATA.findIndex((p) => p.id === id);
  if (index === -1) return undefined;

  PROFILE_DATA[index] = {
    ...PROFILE_DATA[index],
    ...data,
    updatedAt: Date.now(),
  };

  return PROFILE_DATA[index];
}

/**
 * Create a new profile.
 */
export function createProfile(data: Omit<ProfileData, 'id' | 'createdAt' | 'updatedAt'>): ProfileData {
  const now = Date.now();
  const profile: ProfileData = {
    ...data,
    id: `profile-${now}`,
    createdAt: now,
    updatedAt: now,
  };

  PROFILE_DATA.push(profile);
  return profile;
}

/**
 * Delete a profile by id.
 */
export function deleteProfile(id: string): boolean {
  const index = PROFILE_DATA.findIndex((p) => p.id === id);
  if (index === -1) return false;

  PROFILE_DATA.splice(index, 1);
  return true;
}

/**
 * List all profiles.
 */
export function listProfiles(): ProfileData[] {
  return [...PROFILE_DATA];
}