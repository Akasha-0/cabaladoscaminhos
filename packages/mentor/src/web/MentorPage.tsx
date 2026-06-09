'use client';

import { MentorChat } from './MentorChat';
import type { UserMaps } from '../types';

interface MentorPageProps {
  userId: string;
  maps: UserMaps;
}

export function MentorPage({ userId, maps }: MentorPageProps) {
  return (
    <div className="container mx-auto max-w-4xl h-screen py-8">
      <div className="bg-white rounded-xl shadow-lg h-full overflow-hidden">
        <MentorChat userId={userId} maps={maps} />
      </div>
    </div>
  );
}
