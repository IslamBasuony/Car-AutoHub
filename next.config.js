/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Wikimedia hosts — the app serves photos through the same-origin
      // /api/car-image proxy (which needs no remote config), but allowing
      // these hosts directly keeps next/image working if an upstream photo
      // URL is ever rendered directly.
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "thumb.wikimedia.org" },
    ],
  },
};

module.exports = nextConfig;