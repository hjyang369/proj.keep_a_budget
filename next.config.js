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
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // 클라이언트 사이드에서 Node.js 모듈 제외
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        child_process: false,
        http2: false,
        zlib: false,
        url: false,
        querystring: false,
        crypto: false,
        stream: false,
        util: false,
        buffer: false,
        events: false,
        os: false,
        path: false,
        assert: false,
        constants: false,
        domain: false,
        punycode: false,
        process: false,
        vm: false,
        http: false,
        https: false,
        dns: false,
        dgram: false,
        cluster: false,
        worker_threads: false,
        perf_hooks: false,
        async_hooks: false,
        inspector: false,
        trace_events: false,
        v8: false,
        wasi: false,
        worker_threads: false,
      };
    }
    return config;
  },
};

module.exports = withPWA(nextConfig);
