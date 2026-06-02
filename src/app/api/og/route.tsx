// fallow-ignore-next-line unresolved-import
// @ts-ignore - @vercel/og not installed, using ImageResponse type
import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const title = searchParams.get('title') || 'Cabala dos Caminhos';
  const subtitle = searchParams.get('subtitle') || 'Tecnologia Sagrada de Alinhamento Espiritual';
  const type = searchParams.get('type') || 'default';

  // Colors based on type
  const colors = {
    default: { primary: '#fbbf24', secondary: '#d4a520' },
    mapa: { primary: '#a78bfa', secondary: '#8b5cf6' },
    calendario: { primary: '#34d399', secondary: '#10b981' },
    onboarding: { primary: '#f472b6', secondary: '#ec4899' },
  };

  const color = colors[type as keyof typeof colors] || colors.default;

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0f',
          backgroundImage: 'radial-gradient(circle at 50% 50%, #1a1025 0%, #0a0a0f 70%)',
          fontSize: 48,
          fontFamily: 'serif',
        }}
      >
        {/* Stars background */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexWrap: 'wrap', gap: '40px', padding: '60px', opacity: 0.4 }}>
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                borderRadius: '50%',
                backgroundColor: color.primary,
                boxShadow: `0 0 ${Math.random() * 10 + 5}px ${color.primary}`,
              }}
            />
          ))}
        </div>

        {/* Central glow */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color.primary}20 0%, transparent 70%)`,
        }} />

        {/* Icon */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${color.primary}30, ${color.secondary}20)`,
          border: `2px solid ${color.primary}50`,
          marginBottom: '40px',
          boxShadow: `0 0 60px ${color.primary}40`,
        }}>
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" style={{ color: color.primary }}>
            <path
              d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
              fill="currentColor"
            />
          </svg>
        </div>

        {/* Title */}
        <div style={{
          display: 'flex',
          color: color.primary,
          fontSize: 72,
          fontWeight: 'bold',
          fontFamily: 'serif',
          textShadow: `0 0 40px ${color.primary}60`,
          marginBottom: '20px',
        }}>
          {title}
        </div>

        {/* Divider */}
        <div style={{
          width: '400px',
          height: '2px',
          background: `linear-gradient(90deg, transparent, ${color.primary}80, transparent)`,
          marginBottom: '30px',
        }} />

        {/* Subtitle */}
        <div style={{
          display: 'flex',
          color: '#94a3b8',
          fontSize: 28,
          fontFamily: 'sans-serif',
        }}>
          {subtitle}
        </div>

        {/* Footer */}
        <div style={{
          position: 'absolute',
          bottom: '40px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 24px',
          borderRadius: '100px',
          backgroundColor: `${color.primary}10`,
          border: `1px solid ${color.primary}30`,
        }}>
          <span style={{ color: color.primary, fontSize: 18, fontFamily: 'sans-serif' }}>
            cabaladoscaminhos.com
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}