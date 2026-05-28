import { NextResponse } from 'next/server';

interface MegiData {
  name: string;
  odu: string;
  meaning: string;
}

const data: MegiData = {
  name: 'Megi',
  odu: 'megi',
  meaning: 'Meaning of megi'
};

export async function GET() {
  return NextResponse.json({ data });
}
