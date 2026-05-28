import { NextRequest, NextResponse } from 'next/server';

// GET /api/mystical/texts - Retrieve mystical texts
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    const id = url.searchParams.get('id');

    const mysticalTexts = {
      texts: [
        { id: '1', title: 'Emerald Tablet', type: 'hermetic', description: 'Ancient text of Hermetic philosophy' },
        { id: '2', title: 'Book of the Law', type: 'thelemic', description: 'Sacred text of Thelema' },
        { id: '3', title: 'Kybalion', type: 'hermetic', description: 'Principles of Hermetic Philosophy' },
        { id: '4', title: 'Sepher Yetzirah', type: 'kabbalistic', description: 'Book of Formation' },
        { id: '5', title: 'Zohar', type: 'kabbalistic', description: 'Splendor of mystical wisdom' },
      ],
    };

    if (id) {
      const text = mysticalTexts.texts.find((t) => t.id === id);
      if (!text) {
        return NextResponse.json({ error: 'Text not found' }, { status: 404 });
      }
      return NextResponse.json({ text }, { status: 200 });
    }

    if (type) {
      const filtered = mysticalTexts.texts.filter((t) => t.type === type);
      return NextResponse.json({ texts: filtered }, { status: 200 });
    }

    return NextResponse.json(mysticalTexts, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Failed to retrieve mystical texts' }, { status: 500 });
  }
}