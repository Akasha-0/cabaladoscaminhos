import { NextResponse } from 'next/server';

interface OkanranData {
  name: string;
  odu: string;
  meaning: string;
}

const data: OkanranData = {
  name: 'Okanran',
  odu: 'okanran',
  meaning: 'Meaning of okanran'
};

export async function GET() {
  return NextResponse.json({ data });
}
