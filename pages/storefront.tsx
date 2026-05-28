import Head from "next/head"
import { ProductGrid } from "@/components/ShopifyStorefront"

const SHOPIFY_STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || "supercompute.myshopify.com"

export default function StorefrontPage() {
  return (
    <>
      <Head>
        <title>StoreFront — Supercompute</title>
        <meta name="description" content="Merch, classes, and agent services" />
      </Head>
      <div style={{ padding: "24px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <span className="label">// storefront</span>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: "var(--text)", margin: "8px 0" }}>
            Supercompute StoreFront
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>
            Merch, classes, and agent services powered by Shopify
          </p>
        </div>

        <ProductGrid count={12} />

        <div style={{ marginTop: 48, textAlign: "center" }}>
          <a
            href={`https://${SHOPIFY_STORE_DOMAIN}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              padding: "12px 24px",
              background: "var(--accent)",
              color: "#fff",
              borderRadius: 6,
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Visit Full Store →
          </a>
        </div>
      </div>
    </>
  )
}