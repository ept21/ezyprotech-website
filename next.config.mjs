/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'cms.ezyprotech.com' },
            { protocol: 'https', hostname: '**.on-forge.com' },
            { protocol: 'https', hostname: '*.gravatar.com' },
            { protocol: 'http',  hostname: 'localhost' },
            { protocol: 'http',  hostname: '127.0.0.1' },
            { protocol: 'https', hostname: 'i0.wp.com' },
            { protocol: 'https', hostname: 'i1.wp.com' },
            { protocol: 'https', hostname: 'i2.wp.com' }
        ],
    },

    // optional: keep dev moving even if eslint/typescript complain
    eslint: { ignoreDuringBuilds: true },
    typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
