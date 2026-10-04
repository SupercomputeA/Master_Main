/**
 * components/tradedesk/lib/rpc-upstream.ts
 *
 * SINGLE decision point for the TradeDesk chain read path's upstream RPC URL.
 *
 * Why this file exists (card t_e46e616a): the deployment contract defines
 * `ROBINHOOD_ALCHEMY_RPC_BASE_URL` as a *keyless base*
 * (`https://robinhood-mainnet.g.alchemy.com/v2`) while `ALCHEMY_API_KEY` is an
 * encrypted secret that may legitimately be absent. Anything that treats the
 * base as a request-ready endpoint — `cast --rpc-url "$ROBINHOOD_ALCHEMY_RPC_BASE_URL"`,
 * a shell script, `viem.http(base)`, `curl "$base"` — gets:
 *
 *     HTTP 401 {"jsonrpc":"2.0","id":1,"error":{"code":-32600,"message":"Must be authenticated!"}}
 *
 * That 401 is not a credentials outage: it is a *keyless URL* being used as an
 * endpoint. Reproduced 2026-09-15 against `https://robinhood-mainnet.g.alchemy.com/v2`
 * with no key, and against a bogus well-formed key (same 401, same body).
 *
 * Alchemy does support this chain — `list_chains` reports
 * `ROBINHOOD_MAINNET (robinhood-mainnet) [chainId: 4663]` and
 * `ROBINHOOD_TESTNET (robinhood-testnet) [chainId: 46630]` — so the base is the
 * right host and the right path prefix, and the key is the only missing part.
 *
 * Resolution rules (fail closed, never fabricate, never return a keyless
 * Alchemy URL):
 *
 *   1. base + key  -> `<base>/v2/<key>`   provider "alchemy"
 *   2. otherwise   -> `ROBINHOOD_PUBLIC_RPC_URL` (live-verified)
 *                                          provider "public-fallback"
 *   3. neither     -> throw RpcUpstreamUnconfiguredError
 *
 * Callers MUST label the provider state they got back (`describeRpcUpstream`)
 * so the UI can never present fallback data as Alchemy-backed data, and MUST
 * log errors through `redactRpcUrl` so an embedded key never reaches a log.
 *
 * Dependency-free by design: this module is imported from Cloudflare Pages
 * Functions, which must not pull viem/keccak into the worker bundle.
 */

/** Robinhood Chain mainnet (Arbitrum L2, ETH gas). */
export const ROBINHOOD_MAINNET_CHAIN_ID = 4663;

/** Robinhood Chain testnet. */
export const ROBINHOOD_TESTNET_CHAIN_ID = 46630;

/** Alchemy network slugs for Robinhood Chain (confirmed via Alchemy `list_chains`). */
export const ROBINHOOD_ALCHEMY_NETWORKS = {
  mainnet: "robinhood-mainnet",
  testnet: "robinhood-testnet",
} as const;

export type RpcUpstreamProvider = "alchemy" | "public-fallback";

/** Why the resolver landed where it did — surface this, never hide it. */
export type RpcUpstreamReason =
  | "alchemy_keyed"
  | "alchemy_key_missing"
  | "alchemy_base_missing"
  | "alchemy_config_invalid"
  | "public_fallback";

export interface RpcUpstreamEnv {
  readonly ALCHEMY_API_KEY?: string | undefined;
  /** KEYLESS base, e.g. `https://robinhood-mainnet.g.alchemy.com/v2`. */
  readonly ROBINHOOD_ALCHEMY_RPC_BASE_URL?: string | undefined;
  /** Explicit read-only fallback, e.g. `https://rpc.mainnet.chain.robinhood.com`. */
  readonly ROBINHOOD_PUBLIC_RPC_URL?: string | undefined;
}

export interface ResolvedRpcUpstream {
  /** Request-ready JSON-RPC endpoint. Never a keyless Alchemy URL. */
  readonly url: string;
  readonly provider: RpcUpstreamProvider;
  readonly reason: RpcUpstreamReason;
}

export class RpcUpstreamUnconfiguredError extends Error {
  readonly code = "rpc_upstream_unconfigured";

  constructor() {
    super(
      "TradeDesk chain read path: no upstream configured. Set ALCHEMY_API_KEY " +
        "(Bitwarden item ALCHEMY_API_KEY) together with ROBINHOOD_ALCHEMY_RPC_BASE_URL, " +
        "or set ROBINHOOD_PUBLIC_RPC_URL.",
    );
    this.name = "RpcUpstreamUnconfiguredError";
  }
}

const ALCHEMY_HOST_RE = /^[a-z0-9-]+\.g\.alchemy\.com$/i;

function clean(value: string | undefined): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function stripTrailingSlashes(value: string): string {
  return value.replace(/\/+$/, "");
}

function isHttpsAbsoluteUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function parsePathSegments(url: string): string[] | undefined {
  try {
    return new URL(url)
      .pathname.split("/")
      .filter((segment) => segment.length > 0);
  } catch {
    return undefined;
  }
}

/**
 * True when `url` points at Alchemy but carries no API key in the path — i.e.
 * it is `…/v2` or `…/v2/`, exactly the shape that answers HTTP 401.
 */
export function isKeylessAlchemyUrl(url: string): boolean {
  const cleaned = clean(url);
  if (cleaned === undefined) return false;
  let hostname: string;
  try {
    hostname = new URL(cleaned).hostname;
  } catch {
    return false;
  }
  if (!ALCHEMY_HOST_RE.test(hostname)) return false;
  const segments = parsePathSegments(cleaned) ?? [];
  const v2Index = segments.indexOf("v2");
  if (v2Index === -1) return true;
  // Anything after `/v2` is the key; nothing after it means keyless.
  return segments.length === v2Index + 1;
}

/**
 * Join a keyless Alchemy base with an API key:
 *
 *   base `https://robinhood-mainnet.g.alchemy.com/v2`  + key -> `…/v2/<key>`
 *   base `https://robinhood-mainnet.g.alchemy.com`     + key -> `…/v2/<key>`
 *   base `https://robinhood-mainnet.g.alchemy.com/v2/` + key -> `…/v2/<key>`
 *   base `https://robinhood-mainnet.g.alchemy.com/v2/<key>` -> unchanged
 *                                                              (no double-append)
 */
export function buildAlchemyEndpoint(baseUrl: string, apiKey: string): string {
  const base = stripTrailingSlashes(baseUrl.trim());
  const key = apiKey.trim();
  const segments = parsePathSegments(base) ?? [];
  const v2Index = segments.indexOf("v2");
  const alreadyKeyed = v2Index !== -1 && segments.length > v2Index + 1;
  if (alreadyKeyed) return base;
  const withoutV2 = base.replace(/\/v2$/i, "");
  return `${withoutV2}/v2/${key}`;
}

/**
 * Resolve the upstream the read path must use. Never returns a keyless Alchemy
 * URL; never invents a provider; throws when the environment offers nothing.
 */
export function resolveRobinhoodRpcUpstream(env: RpcUpstreamEnv): ResolvedRpcUpstream {
  const base = clean(env.ROBINHOOD_ALCHEMY_RPC_BASE_URL);
  const key = clean(env.ALCHEMY_API_KEY);
  const fallback = clean(env.ROBINHOOD_PUBLIC_RPC_URL);

  if (base !== undefined && key !== undefined) {
    const endpoint = buildAlchemyEndpoint(base, key);
    if (isHttpsAbsoluteUrl(endpoint) && !isKeylessAlchemyUrl(endpoint)) {
      return { url: endpoint, provider: "alchemy", reason: "alchemy_keyed" };
    }
    if (fallback !== undefined && isHttpsAbsoluteUrl(fallback)) {
      return {
        url: stripTrailingSlashes(fallback),
        provider: "public-fallback",
        reason: "alchemy_config_invalid",
      };
    }
    throw new RpcUpstreamUnconfiguredError();
  }

  if (fallback !== undefined && isHttpsAbsoluteUrl(fallback)) {
    // At most one of base/key is defined here: the pair was handled above.
    let reason: RpcUpstreamReason = "public_fallback";
    if (base !== undefined) reason = "alchemy_key_missing";
    else if (key !== undefined) reason = "alchemy_base_missing";
    return {
      url: stripTrailingSlashes(fallback),
      provider: "public-fallback",
      reason,
    };
  }

  throw new RpcUpstreamUnconfiguredError();
}

/**
 * True when the resolved upstream is Alchemy *and* carries a key. Callers that
 * need a hard guarantee (e.g. archive queries the public RPC cannot serve)
 * should assert on this instead of string-matching the URL.
 */
export function isKeyedAlchemyUpstream(
  upstream: ResolvedRpcUpstream,
): upstream is ResolvedRpcUpstream & { provider: "alchemy" } {
  return upstream.provider === "alchemy" && !isKeylessAlchemyUrl(upstream.url);
}

/** Human-readable provider label for the surface's quote-source state line. */
export function describeRpcUpstream(upstream: ResolvedRpcUpstream): string {
  if (upstream.provider === "alchemy") {
    return "Alchemy (keyed) — Robinhood Chain mainnet";
  }
  switch (upstream.reason) {
    case "alchemy_key_missing":
      return "Public Robinhood RPC — read-only fallback (ALCHEMY_API_KEY not configured)";
    case "alchemy_base_missing":
      return "Public Robinhood RPC — read-only fallback (ROBINHOOD_ALCHEMY_RPC_BASE_URL not configured)";
    case "alchemy_config_invalid":
      return "Public Robinhood RPC — read-only fallback (Alchemy configuration rejected)";
    default:
      return "Public Robinhood RPC — read-only fallback";
  }
}

/** Mask the key segment of an RPC URL so logs never carry credentials. */
export function redactRpcUrl(url: string): string {
  const cleaned = clean(url);
  if (cleaned === undefined) return "<empty-rpc-url>";
  let parsed: URL;
  try {
    parsed = new URL(cleaned);
  } catch {
    return "<unparseable-rpc-url>";
  }
  const segments = parsed.pathname.split("/").filter((segment) => segment.length > 0);
  const v2Index = segments.indexOf("v2");
  if (v2Index !== -1 && segments.length > v2Index + 1) {
    segments[v2Index + 1] = "***";
    parsed.pathname = `/${segments.join("/")}`;
  }
  return parsed.toString();
}
