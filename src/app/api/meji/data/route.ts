import { NextResponse } from 'next/server';

interface MejiData {
  name: string;
  odu: string;
  meaning: string;
}

const data: MejiData = {
  name: 'Meji',
  odu: 'meji',
  meaning: 'Meaning of meji'
};

export async function GET() {
  return NextResponse.json({ data });
}
