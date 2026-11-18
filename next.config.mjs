/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
  // Make sure the JSON data files ship with the serverless functions on Vercel.
  outputFileTracingIncludes: { "/**": ["./data/**/*"] },
};
export default nextConfig;
