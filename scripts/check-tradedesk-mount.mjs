import assert from "node:assert/strict"
import fs from "node:fs"

const pkg = JSON.parse(fs.readFileSync(new URL("../package.json", import.meta.url), "utf8"))
const page = fs.readFileSync(new URL("../pages/tradedesk.tsx", import.meta.url), "utf8")
const nav = fs.readFileSync(new URL("../components/PublicLayout.tsx", import.meta.url), "utf8")
const mount = fs.readFileSync(new URL("../components/TradeDeskMount.tsx", import.meta.url), "utf8")
const nextConfig = fs.readFileSync(new URL("../next.config.js", import.meta.url), "utf8")

// TradeDesk is VENDORED into the website repo (components/tradedesk/) rather than
// pulled from the private SupercomputeA/supercompute-tradedesk repo. That private
// git dependency was the deterministic CI blocker: GitHub Actions has no SSH key,
// and GITHUB_TOKEN cannot read OTHER private repos in the org, so `npm ci` failed
// with "Repository not found". Assert the vendored source is present instead.
const VENDORED_FILES = [
  "../components/tradedesk/index.ts",
  "../components/tradedesk/TradeDesk.tsx",
  "../components/tradedesk/types.ts",
  "../components/tradedesk/lib/chain.ts",
  "../components/tradedesk/lib/capabilities.ts",
  "../components/tradedesk/lib/rpc-upstream.ts",
]
for (const f of VENDORED_FILES) {
  assert.ok(fs.existsSync(new URL(f, import.meta.url)), `missing vendored file: ${f}`)
}

// The old private git dependency must be gone from both package.json and next.config.
assert.equal(
  pkg.dependencies?.["@supercompute/tradedesk"],
  undefined,
  "@supercompute/tradedesk must be vendored, not listed as a dependency",
)
assert.ok(
  !nextConfig.includes("@supercompute/tradedesk"),
  "next.config.js must not reference the removed package",
)

assert.match(mount, /from ["']\.\/tradedesk["']/)
assert.match(mount, /<TradeDesk\s+mode=["']read-only["']/)
assert.match(page, /<PublicLayout\b/)
assert.match(page, /import\(["']\.\.\/components\/TradeDeskMount["']\)/)
assert.match(page, /ssr:\s*false/)
assert.match(nav, /href:\s*["']\/tradedesk["']/)

console.log("TradeDesk mount contract verified (vendored)")
