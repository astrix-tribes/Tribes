/** @type {import('next').NextConfig} */ 
const nextConfig = { 
  typescript: { 
    ignoreBuildErrors: true 
  }, 
  eslint: { 
    ignoreDuringBuilds: true 
  },
  images: {
    unoptimized: true,
    // The following configuration is now redundant since we're using unoptimized: true
    // but keeping it as a reference in case you want to switch back to optimized images
    // with specific domains in the future
    domains: [
      'cdn.pixabay.com',
      'images.unsplash.com',
      'i.imgur.com',
      'picsum.photos',
      'via.placeholder.com',
      'cloudfront.net',
      'res.cloudinary.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  }
}; 

export default nextConfig;
