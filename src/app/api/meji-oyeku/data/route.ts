import { NextResponse } from 'next/server';

interface MejiOyekuData {
  name: string;
  odu: string;
  meaning: string;
}

const data: MejiOyekuData = {
  name: 'Meji-Oyeku',
  odu: 'meji-oyeku',
  meaning: 'Meaning of meji-oyeku'
};

export async function GET() {
  return NextResponse.json({ data });
}
