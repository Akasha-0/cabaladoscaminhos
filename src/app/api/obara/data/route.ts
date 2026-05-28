import { NextResponse } from 'next/server';

interface ObaraData {
  name: string;
  odu: string;
  meaning: string;
}

const data: ObaraData = {
  name: 'Obara',
  odu: 'obara',
  meaning: 'Meaning of obara'
};

export async function GET() {
  return NextResponse.json({ data });
}