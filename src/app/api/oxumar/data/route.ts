import { NextResponse } from 'next/server';

interface OxumarData {
  name: string;
  odu: string;
  meaning: string;
}

const data: OxumarData = {
  name: 'Oxumar',
  odu: 'oxumar',
  meaning: 'Meaning of oxumar'
};

export async function GET() {
  return NextResponse.json({ data });
}
