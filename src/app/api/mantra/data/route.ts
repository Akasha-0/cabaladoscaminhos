// ============================================================
// MANTRA DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for mantra data
// - Retrieve all mantras
// - Retrieve single mantra by ID
// - Retrieve mantra categories
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

interface MantraCategory {
  name: string;
  description: string;
  weight: number;
}

// GET /api/mantra/data - Get mantra data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    const mantras = [
      { id: 'om', name: 'Om', sanskrit: 'ॐ', element: 'Ether', vibration: 7, meaning: 'Universal consciousness' },
      { id: 'so-ham', name: 'So Ham', sanskrit: 'सोऽहम्', element: 'Air', vibration: 6, meaning: 'I am that' },
      { id: 'om-mani-padme-hum', name: 'Om Mani Padme Hum', sanskrit: 'ॐ मणि पद्मे हूँ', element: 'Water', vibration: 8, meaning: 'Jewel in the lotus' },
      { id: 'gayatri', name: 'Gayatri Mantra', sanskrit: 'ॐ भूर्भुवः स्वः', element: 'Light', vibration: 9, meaning: 'Divine light mantra' },
      { id: 'om-namah-shivaya', name: 'Om Namah Shivaya', sanskrit: 'ॐ नमः शिवाय', element: 'Fire', vibration: 7, meaning: 'Salutation to Shiva' },
      { id: 'lokah-samastah', name: 'Lokah Samastah', sanskrit: 'लोकः समस्तः', element: 'Earth', vibration: 6, meaning: 'Peace for all beings' },
      { id: 'mahamrityunjaya', name: 'Mahamrityunjaya', sanskrit: 'ॐ त्र्यम्बकं यजामहे', element: 'Fire', vibration: 8, meaning: 'Great healer mantra' },
      { id: 'om-shanti', name: 'Om Shanti', sanskrit: 'ॐ शान्तिः', element: 'Ether', vibration: 5, meaning: 'Peace peace peace' },
      { id: 'hare-krishna', name: 'Hare Krishna', sanskrit: 'हरे कृष्ण', element: 'Water', vibration: 7, meaning: 'Calling the divine' },
      { id: 'nam-myoho-renge-kyo', name: 'Nam Myoho Renge Kyo', sanskrit: '南無妙法蓮華経', element: 'Light', vibration: 8, meaning: 'Devotion to the law' },
      { id: 'amen', name: 'Amen', sanskrit: 'אמן', element: 'Light', vibration: 6, meaning: 'So be it' },
      { id: 'amin', name: 'Amin', sanskrit: 'آمين', element: 'Light', vibration: 6, meaning: 'Truth, so be it' },
    ];

    // Return single mantra by ID
    if (id) {
      const record = mantras.find((r) => r.id.toLowerCase() === id.toLowerCase());
      if (!record) {
        return NextResponse.json(
          { success: false, error: 'Mantra not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: record });
    }

    // Return mantra categories
    if (type === 'categories') {
      const categories: MantraCategory[] = [
        { name: 'universal', description: 'Om and universal consciousness mantras', weight: 3 },
        { name: 'healing', description: 'Health, vitality, and recovery mantras', weight: 3 },
        { name: 'protection', description: 'Shielding and spiritual protection mantras', weight: 2 },
        { name: 'love', description: 'Compassion, love, and heart-centered mantras', weight: 2 },
        { name: 'wisdom', description: 'Knowledge, insight, and awakening mantras', weight: 2 },
        { name: 'peace', description: 'Calm, tranquility, and inner peace mantras', weight: 2 },
        { name: 'manifestation', description: 'Abundance, intention, and creation mantras', weight: 2 },
      ];
      return NextResponse.json({ success: true, data: categories });
    }

    // Return mantra records only
    if (type === 'records') {
      return NextResponse.json({ success: true, data: mantras });
    }

    // Default — return all mantra data
    return NextResponse.json({
      success: true,
      data: {
        records: mantras,
        categories: [
          { name: 'universal', description: 'Om and universal consciousness mantras', weight: 3 },
          { name: 'healing', description: 'Health, vitality, and recovery mantras', weight: 3 },
          { name: 'protection', description: 'Shielding and spiritual protection mantras', weight: 2 },
          { name: 'love', description: 'Compassion, love, and heart-centered mantras', weight: 2 },
          { name: 'wisdom', description: 'Knowledge, insight, and awakening mantras', weight: 2 },
          { name: 'peace', description: 'Calm, tranquility, and inner peace mantras', weight: 2 },
          { name: 'manifestation', description: 'Abundance, intention, and creation mantras', weight: 2 },
        ] as MantraCategory[],
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch mantra data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}