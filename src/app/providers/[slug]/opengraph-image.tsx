import { ImageResponse } from 'next/og';
import { PROVIDERS, SERVICE_CATEGORIES } from '@/lib/seed-data';

export const alt = 'Provider Profile';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OGImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const provider = PROVIDERS.find((p) => p.slug === slug);

  if (!provider) {
    return new ImageResponse(
      (
        <div
          style={{
            background: '#0a1628',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#e2e8f0',
            fontSize: '48px',
            fontFamily: 'sans-serif',
          }}
        >
          CyberBench
        </div>
      ),
      { ...size }
    );
  }

  const serviceNames = provider.services
    .map((slug) => SERVICE_CATEGORIES.find((c) => c.slug === slug)?.name)
    .filter(Boolean)
    .slice(0, 3);

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0a1628 0%, #111d33 50%, #0a1628 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '60px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '40px',
          }}
        >
          <div style={{ color: '#00b4d8', fontSize: '20px', fontWeight: 600 }}>
            cyberbench.net
          </div>
          <div
            style={{
              border: '1px solid rgba(0, 180, 216, 0.3)',
              backgroundColor: 'rgba(0, 180, 216, 0.1)',
              borderRadius: '16px',
              padding: '6px 16px',
              fontSize: '14px',
              color: '#00b4d8',
            }}
          >
            Cybersecurity Directory
          </div>
        </div>

        {/* Provider info */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', flex: 1 }}>
          {/* Avatar */}
          <div
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '16px',
              backgroundColor: '#1a2744',
              border: '2px solid #1e3048',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#00b4d8',
              flexShrink: 0,
            }}
          >
            {provider.name.charAt(0)}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                fontSize: '52px',
                fontWeight: 'bold',
                color: '#e2e8f0',
                lineHeight: 1.1,
              }}
            >
              {provider.name}
            </div>
            {provider.headquarters && (
              <div style={{ fontSize: '22px', color: '#94a3b8', marginTop: '8px' }}>
                📍 {provider.headquarters}
              </div>
            )}
          </div>
        </div>

        {/* Services */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
          {serviceNames.map((name) => (
            <div
              key={name}
              style={{
                backgroundColor: 'rgba(0, 180, 216, 0.15)',
                color: '#00b4d8',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '18px',
              }}
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
