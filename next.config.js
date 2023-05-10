module.exports = {
  reactStrictMode: true,
  // for docker
  experimental: {
    outputStandalone: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:3000/:path*",
      },
    ];
  },
};
