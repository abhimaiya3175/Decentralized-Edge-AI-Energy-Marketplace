/** @type {import('next').NextConfig} */
const backendOrigin = process.env.ENERGYCHAIN_BACKEND_URL || "http://localhost:5000";

module.exports = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      { source: "/api/backend/:path*", destination: `${backendOrigin}/:path*` },
      { source: "/backend/:path*", destination: `${backendOrigin}/:path*` },
      { source: "/config/:path*", destination: `${backendOrigin}/config/:path*` },
    ];
  },
};
