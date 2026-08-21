/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  output: "export",
  // The TradeDesk component ships from SupercomputeA/supercompute-tradedesk
  // as raw TypeScript with `"main": "index.ts"`. Turbopack refuses to load
  // `.ts` from node_modules without this opt-in.
  transpilePackages: ["@supercompute/tradedesk"],
}

export default nextConfig
