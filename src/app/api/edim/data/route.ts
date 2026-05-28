import { NextResponse } from 'next/server';

interface EdimData {
  id: string;
  name: string;
  namePt: string;
  description: string;
}

const edimData: EdimData[] = [
  { id: 'edim-01', name: 'Edim', namePt: 'Edim', description: 'Guardião das portas dimensicionais' }
];

export async function GET() {
  return NextResponse.json({ data: edimData });
}
