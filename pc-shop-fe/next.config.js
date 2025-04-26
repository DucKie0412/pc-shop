/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
    experimental: {
        serverActions: {
            allowedOrigins: ['localhost:3000'],
        },
        turbo: {
            rules: {
                '*.svg': ['@svgr/webpack'],
            },
        },
    },
    // Disable Turbopack
    webpack: (config) => {
        return config;
    },
}

module.exports = nextConfig 