import { NextResponse } from 'next/server';

interface MejiYekuData {
  name: string;
  odu: string;
  meaning: string;
}

const data: MejiYekuData = {
  name: 'Meji-Yeku',
  odu: 'meji-yeku',
  meaning: 'Meaning of meji-yeku'
};

export async function GET() {
  return NextResponse.json({ data });
}