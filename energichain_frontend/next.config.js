/** @type {import('next').NextConfig} */
const backendOrigin = process.env.ENERGYCHAIN_BACKEND_URL || "http://localhost:5000";

module.exports = {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: "/api/backend/:path*", destination: `${backendOrigin}/:path*` },
      { source: "/backend/:path*", destination: `${backendOrigin}/:path*` },
      { source: "/config/:path*", destination: `${backendOrigin}/config/:path*` },
    ];
  },
};
