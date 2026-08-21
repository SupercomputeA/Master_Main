import assert from "node:assert/strict"
import fs from "node:fs"

const pkg = JSON.parse(fs.readFileSync(new URL("../package.json", import.meta.url), "utf8"))
const page = fs.readFileSync(new URL("../pages/tradedesk.tsx", import.meta.url), "utf8")
const nav = fs.readFileSync(new URL("../components/PublicLayout.tsx", import.meta.url), "utf8")
const mount = fs.readFileSync(new URL("../components/TradeDeskMount.tsx", import.meta.url), "utf8")
const nextConfig = fs.readFileSync(new URL("../next.config.js", import.meta.url), "utf8")

const TRADEDESK_DEP_PATTERN = /^https:\/\/github\.com\/SupercomputeA\/supercompute-tradedesk\.git#develop$/

assert.match(
  pkg.dependencies?.["@supercompute/tradedesk"] ?? "",
  TRADEDESK_DEP_PATTERN,
  "TradeDesk must be sourced from the tradedesk repository's develop branch via HTTPS (so CI can resolve the private repo with GITHUB_TOKEN)",
)
assert.match(mount, /from ["']@supercompute\/tradedesk\/components\/tradedesk["']/)
assert.match(mount, /<TradeDesk\s+mode=["']read-only["']/)
assert.match(page, /<PublicLayout\b/)
assert.match(page, /import\(["']\.\.\/components\/TradeDeskMount["']\)/)
assert.match(page, /ssr:\s*false/)
assert.match(nav, /href:\s*["']\/tradedesk["']/)
assert.match(nextConfig, /transpilePackages:\s*\[[^\]]*@supercompute\/tradedesk[^\]]*\]/)

console.log("TradeDesk mount contract verified")
