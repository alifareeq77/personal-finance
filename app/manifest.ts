import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'المالية',
    short_name: 'المالية',
    description: 'تتبع المالية الشخصية',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f0d1e',
    theme_color: '#0f0d1e',
    orientation: 'portrait',
    icons: [
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/apple-icon',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/apple-icon',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
