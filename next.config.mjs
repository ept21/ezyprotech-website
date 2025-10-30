import path from 'node:path'

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: { remotePatterns: [{ protocol: 'https', hostname: '**' }] },
    typedRoutes: false,
    webpack: (config) => {
        config.resolve.alias['@'] = path.resolve(process.cwd(), 'src/app')
        return config
    },
}

export default nextConfig
