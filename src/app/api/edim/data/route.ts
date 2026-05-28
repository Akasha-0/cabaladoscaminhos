import { NextResponse } from 'next/server';

interface EdimData {
  name: string;
  title: string;
  description: string;
}

const data: EdimData = {
  name: 'Edim',
  title: 'Edim',
  description: 'Edim'
};

export async function GET() {
  return NextResponse.json({ data });
}
