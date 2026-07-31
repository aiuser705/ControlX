/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
  webpack: (config) => {
    config.module.rules.push({
      test: /\.glsl$/,
      use: ['raw-loader', 'glslify-loader'],
    });
    return config;
  },
};

module.exports = nextConfig;
