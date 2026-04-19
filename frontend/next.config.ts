import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.watchOptions = {
      poll: 5000, // Check for changes every 5000ms (5 seconds)
      aggregateTimeout: 300, // Delay rebuild after first change
    };
    return config;
  },
};

export default nextConfig;
