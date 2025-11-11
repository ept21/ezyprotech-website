import path from 'node:path'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { remotePatterns: [{ protocol: 'https', hostname: '**' }] },
  typedRoutes: false,
  webpack: (config) => {
    // התיקון הקריטי: מפנה כעת לשורש src
    config.resolve.alias['@'] = path.resolve(process.cwd(), 'src')
    return config
  },
}

export default nextConfig