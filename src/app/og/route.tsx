import { ImageResponse } from 'next/og';
import { getPublishedContent } from '@/lib/content/store';

/** The default social sharing image, built from the owner's name and description. */
export async function GET() {
  const content = await getPublishedContent();
  const { profile, site, theme } = content;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: '#ffffff',
          color: '#1d1d1f',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 30, fontWeight: 600 }}>
          <div style={{ width: 22, height: 22, borderRadius: 999, background: theme.accent }} />
          {profile.name}
        </div>
        <div style={{ display: 'flex', fontSize: 60, lineHeight: 1.1, letterSpacing: -2, fontWeight: 600, maxWidth: 1000 }}>
          {site.description || profile.role}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
