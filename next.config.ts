/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "geolocation=()" },
          { key: "Cache-Control", value: "no-store" },
          ...(isProd
            ? [
                {
                  key: "Content-Security-Policy",
                  value:
                    "default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';",
                },
              ]
            : []),
        ],
      },
    ];
  },
};

module.exports = nextConfig;
