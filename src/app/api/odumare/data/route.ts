import { NextResponse } from 'next/server';

interface OdumareData {
  name: string;
  title: string;
  description: string;
  attributes: string[];
  aspects: Record<string, string>;
  blessings: string[];
  manifestations: string[];
}

const odumareData: OdumareData = {
  name: 'Olodumare',
  title: 'Supreme Creator',
  description: 'Olodumare is the supreme deity in Yoruba tradition.',
  attributes: ['Omnipotence', 'Omniscience', 'Transcendence'],
  aspects: {
    creation: 'Source of all creation',
    destiny: 'Ultimate destiny director'
  },
  blessings: ['Alignment with divine purpose', 'Clarity of destiny'],
  manifestations: ['Through all Òrìṣà', 'In sacred breath']
};

export async function GET() {
  return NextResponse.json({ data: odumareData });
}
