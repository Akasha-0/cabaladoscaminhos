import { NextResponse } from 'next/server';

interface IworiData {
  name: string;
  odu: string;
  meaning: string;
}

const data: IworiData = {
  name: 'Iwori',
  odu: 'iwori',
  meaning: 'Meaning of iwori'
};

export async function GET() {
  return NextResponse.json({ data });
}
