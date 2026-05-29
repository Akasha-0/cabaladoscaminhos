/**
 * Marma Practice Module
 * Handles Marma point therapy practice sessions
 */

export interface MarmaPracticeSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  pointsTargeted: string[];
  duration: number;
  notes?: string;
}

export interface MarmaPoint {
  id: string;
  name: string;
  sanskrit: string;
  location: string;
  energetics?: string;
}

const _activeSession: MarmaPracticeSession | null = null;

const MARMA_POINTS: MarmaPoint[] = [
  { id: 'sahasrara', name: 'Crown', sanskrit: 'Sahasrara', location: 'Top of head' },
  { id: 'ajna', name: 'Third Eye', sanskrit: 'Ajna', location: 'Between eyebrows' },
  { id: 'shankha', name: 'Temple', sanskrit: 'Shankha', location: 'Temporal region' },
  { id: 'sthapani', name: 'Bridge', sanskrit: 'Sthapani', location: 'Center of forehead' },
  { id: 'hri', name: 'Heart Center', sanskrit: 'Hri', location: 'Heart region' },
  { id: 'nabhi', name: 'Navel', sanskrit: 'Nabhi', location: 'Abdomen' },
  { id: 'muladhara', name: 'Root', sanskrit: 'Muladhara', location: 'Base of spine' },
];

/**
 * Start a new Marma practice session
 */
export function startPractice(points: string[] = []): MarmaPracticeSession {
  const session: MarmaPracticeSession = {
    id: crypto.randomUUID(),
    startTime: new Date(),
    pointsTargeted: points.length > 0 ? points : MARMA_POINTS.map(p => p.id),
    duration: 0,
  };
  return session;
}

/**
 * Complete a Marma practice session
 */
export function completePractice(session: MarmaPracticeSession, notes?: string): MarmaPracticeSession {
  const completed: MarmaPracticeSession = {
    ...session,
    endTime: new Date(),
    duration: Math.round((Date.now() - session.startTime.getTime()) / 60000),
    notes,
  };
  return completed;
}

/**
 * Perform a complete Marma practice session
 */
export async function performPractice(
  points: string[] = [],
  duration: number = 15
): Promise<MarmaPracticeSession> {
  const session = startPractice(points);
  await new Promise(resolve => setTimeout(resolve, 100));
  return completePractice(session, `Marma practice completed - ${duration} minutes`);
}

/**
 * Get all available Marma points
 */
export function getMarmaPoints(): MarmaPoint[] {
  return [...MARMA_POINTS];
}

/**
 * Get a specific Marma point by ID
 */
export function getMarmaPoint(id: string): MarmaPoint | undefined {
  return MARMA_POINTS.find(p => p.id === id);
}
