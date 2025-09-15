const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  // disable: process.env.NODE_ENV === "development",
  exclude: [/app-build-manifest\.json$/],
  // swSrc: "src/worker.js",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router is enabled by default in Next.js 13+
  experimental: {
    esmExternals: false,
    reactStrictMode: true,
  },
};

module.exports = withPWA(nextConfig);
