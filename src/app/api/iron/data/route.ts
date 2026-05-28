import { NextResponse } from 'next/server';

interface IronData {
  name: string;
  odu: string;
  meaning: string;
}

const data: IronData = {
  name: 'Iron',
  odu: 'iron',
  meaning: 'Meaning of iron'
};

export async function GET() {
  return NextResponse.json({ data });
}
