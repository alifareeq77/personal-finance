import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f0d1e',
          borderRadius: 24,
          boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.06), 0 0 0 1px rgba(167, 139, 250, 0.1)',
        }}
      >
        <span
          style={{
            fontSize: 72,
            color: '#a78bfa',
            fontWeight: 700,
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          م
        </span>
      </div>
    ),
    { ...size }
  );
}
