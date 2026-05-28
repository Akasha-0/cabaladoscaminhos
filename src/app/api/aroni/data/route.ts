import { NextResponse } from 'next/server';

interface AroniData {
  name: string;
  odu: string;
  meaning: string;
}

const data: AroniData = {
  name: 'Aroni',
  odu: 'aroni',
  meaning: 'Meaning of aroni'
};

export async function GET() {
  return NextResponse.json({ data });
}
