import type { NextConfig } from 'next'
import { resolve } from 'path'

const nextConfig: NextConfig = {
  turbopack: {
    root: resolve(__dirname),
  },
  headers: async () => [
    {
      // Cache static assets (JS, CSS, images) for PWA offline support
      source: '/:path*(svg|jpg|png|webp|ico|woff|woff2)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
    {
      // Service worker must not be cached by the browser
      source: '/sw.js',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=0, must-revalidate',
        },
        {
          key: 'Service-Worker-Allowed',
          value: '/',
        },
      ],
    },
  ],
}

export default nextConfig
