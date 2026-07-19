/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // @react-pdf/renderer ships native-ish deps that must not be bundled by the
  // Next server compiler — keep it external so the PDF route works on Vercel.
  serverExternalPackages: ["@react-pdf/renderer"],
};

export default nextConfig;
