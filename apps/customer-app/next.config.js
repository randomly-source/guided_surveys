/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@repo/realtime', '@repo/supabase', '@repo/survey-core'],
}

module.exports = nextConfig