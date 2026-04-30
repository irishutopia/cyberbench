import { ImageResponse } from 'next/og';

export const alt = 'CyberBench — Find the Best Cybersecurity Providers';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0a1628 0%, #111d33 50%, #0a1628 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          padding: '60px',
        }}
      >
        {/* Top badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: '1px solid rgba(0, 180, 216, 0.3)',
            backgroundColor: 'rgba(0, 180, 216, 0.1)',
            borderRadius: '24px',
            padding: '8px 20px',
            fontSize: '18px',
            color: '#00b4d8',
            marginBottom: '24px',
          }}
        >
          🛡️ The Trusted Cybersecurity Directory
        </div>

        {/* Main title */}
        <div
          style={{
            fontSize: '64px',
            fontWeight: 'bold',
            color: '#e2e8f0',
            textAlign: 'center',
            lineHeight: 1.2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <span>Find the Right</span>
          <span style={{ color: '#00b4d8' }}>Cybersecurity Partner</span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '24px',
            color: '#94a3b8',
            marginTop: '20px',
            textAlign: 'center',
          }}
        >
          Compare 50+ vetted providers · Penetration Testing · MSSP · Compliance
        </div>

        {/* Domain */}
        <div
          style={{
            fontSize: '22px',
            color: '#00b4d8',
            marginTop: '40px',
            fontWeight: 600,
          }}
        >
          cyberbench.net
        </div>
      </div>
    ),
    { ...size }
  );
}
