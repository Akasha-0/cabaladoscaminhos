// ============================================================
// DOSHA DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for dosha data
// - Retrieve all doshas
// - Retrieve single dosha by ID
// - Retrieve dosha qualities
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

interface DoshaCategory {
  name: string;
  description: string;
  weight: number;
}

// GET /api/dosha/data - Get dosha data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    const doshas = [
      {
        id: 'vata',
        name: 'Vata',
        element: 'Air + Ether',
        qualities: ['dry', 'light', 'cold', 'mobile', 'subtle'],
        physicalTraits: ['Thin body frame', 'Dry skin', 'Cold hands and feet', 'Light sleep', 'Quick mind'],
        mentalTraits: ['Creative', 'Quick learner', 'Enthusiastic', 'Flexible', 'Spontaneous'],
        balanced: ['Creative expression', 'Regular routine', 'Warm foods', 'Grounding practices'],
        unbalanced: ['Anxiety', 'Insomnia', 'Dry skin', 'Digestive issues', 'Restlessness'],
        diet: {
          favor: ['Warm', 'moist', 'nourishing foods', 'cooked vegetables', 'grains', 'healthy fats'],
          avoid: ['Cold', 'dry', 'crunchy foods', 'caffeine', 'processed sugar'],
        },
        lifestyle: ['Maintain regular sleep schedule', 'Practice grounding meditation', 'Stay warm', 'Avoid overstimulation'],
        color: '#9B59B6',
        chakra: 'Sacral',
        vibration: 5,
      },
      {
        id: 'pitta',
        name: 'Pitta',
        element: 'Fire + Water',
        qualities: ['hot', 'sharp', 'oily', 'liquid', 'spreading'],
        physicalTraits: ['Medium body frame', 'Warm body temperature', 'Strong digestion', 'Oil skin', 'Premature graying'],
        mentalTraits: ['Intelligent', 'Ambitious', 'Determined', 'Decisive', 'Natural leader'],
        balanced: ['Focused mind', 'Strong digestion', 'Healthy glow', 'Even temperament'],
        unbalanced: ['Irritability', 'Inflammation', 'Acne', 'Heartburn', 'Perfectionism'],
        diet: {
          favor: ['Cool', 'refreshing foods', 'sweet fruits', 'leafy greens', 'coconut water'],
          avoid: ['Spicy', 'oily', 'fried foods', 'alcohol', 'excessive salt'],
        },
        lifestyle: ['Practice cooling breathwork', 'Avoid overheating', 'Schedule downtime', 'Cultivate patience'],
        color: '#E74C3C',
        chakra: 'Solar Plexus',
        vibration: 6,
      },
      {
        id: 'kapha',
        name: 'Kapha',
        element: 'Earth + Water',
        qualities: ['heavy', 'slow', 'cold', 'oily', 'dense'],
        physicalTraits: ['Larger body frame', 'Thick hair', 'Oily skin', 'Deep sleep', 'Slow metabolism'],
        mentalTraits: ['Patient', 'Compassionate', 'Loyal', 'Stable', 'Supportive'],
        balanced: ['Inner calm', 'Strong immunity', 'Steady energy', 'Emotional stability'],
        unbalanced: ['Weight gain', 'Lethargy', 'Depression', 'Congestion', 'Attachment'],
        diet: {
          favor: ['Light', 'dry', 'warm foods', 'leafy greens', ' legumes', 'spices'],
          avoid: ['Heavy', 'oily', 'cold foods', 'dairy', 'excessive carbohydrates'],
        },
        lifestyle: ['Incorporate regular exercise', 'Practice invigorating breathwork', 'Seek new experiences', 'Vary routine'],
        color: '#27AE60',
        chakra: 'Heart',
        vibration: 4,
      },
    ];

    // Return single dosha by ID
    if (id) {
      const record = doshas.find((r) => r.id.toLowerCase() === id.toLowerCase());
      if (!record) {
        return NextResponse.json(
          { success: false, error: 'Dosha not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: record });
    }

    // Return dosha categories
    if (type === 'categories') {
      const categories: DoshaCategory[] = [
        { name: 'vata', description: 'Air and Ether - Creative, mobile, and variable nature', weight: 3 },
        { name: 'pitta', description: 'Fire and Water - Transformative, sharp, and intense nature', weight: 3 },
        { name: 'kapha', description: 'Earth and Water - Grounded, stable, and nurturing nature', weight: 3 },
      ];
      return NextResponse.json({ success: true, data: categories });
    }

    // Return dosha records only
    if (type === 'records') {
      return NextResponse.json({ success: true, data: doshas });
    }

    // Default — return all dosha data
    return NextResponse.json({
      success: true,
      data: {
        records: doshas,
        categories: [
          { name: 'vata', description: 'Air and Ether - Creative, mobile, and variable nature', weight: 3 },
          { name: 'pitta', description: 'Fire and Water - Transformative, sharp, and intense nature', weight: 3 },
          { name: 'kapha', description: 'Earth and Water - Grounded, stable, and nurturing nature', weight: 3 },
        ] as DoshaCategory[],
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch dosha data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
