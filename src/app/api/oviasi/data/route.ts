import { NextResponse } from 'next/server';

interface OviasiData {
  id: string;
  name: string;
  namePt: string;
  description: string;
}

const oviasiData: OviasiData[] = [
  { id: 'oviasi-01', name: 'Oviasi', namePt: 'Oviasi', description: 'Ressurreição e renascimento espiritual' }
];

export async function GET() {
  return NextResponse.json({ data: oviasiData });
}
