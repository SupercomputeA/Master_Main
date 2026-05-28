"use client"

import { useQuery } from "@tanstack/react-query"
import { getProducts, getProductByHandle, formatPrice, type ShopifyProduct } from "@/lib/shopify"

const SHOPIFY_STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || "supercompute.myshopify.com"

type CSSProperties = React.CSSProperties

interface ProductCardProps {
  product: ShopifyProduct
}

function ProductCard({ product }: ProductCardProps) {
  const image = product.images.edges[0]?.node
  const variant = product.variants.edges[0]?.node
  const price = product.priceRange.minVariantPrice

  return (
    <div style={styles.card}>
      {image ? (
        <div style={styles.imageWrapper}>
          <img src={image.url} alt={image.altText || product.title} style={styles.image} />
        </div>
      ) : (
        <div style={styles.imagePlaceholder}>No Image</div>
      )}
      <div style={styles.content}>
        <h3 style={styles.title}>{product.title}</h3>
        <p style={styles.description}>
          {product.description.slice(0, 80)}
          {product.description.length > 80 ? "..." : ""}
        </p>
        <div style={styles.footer}>
          <span style={styles.price}>
            {formatPrice(price.amount, price.currencyCode)}
          </span>
          {variant?.availableForSale ? (
            <a
              href={`https://${SHOPIFY_STORE_DOMAIN}/products/${product.handle}`}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.buyButton}
            >
              Buy →
            </a>
          ) : (
            <span style={styles.soldOut}>Sold Out</span>
          )}
        </div>
      </div>
    </div>
  )
}

export function ProductGrid({ count = 8 }: { count?: number }) {
  const { data: products, isLoading, error } = useQuery({
    queryKey: ["shopify-products", count],
    queryFn: () => getProducts(count),
    staleTime: 1000 * 60 * 5,
  })

  if (isLoading) {
    return (
      <div style={styles.grid}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={styles.skeleton}>
            <div style={styles.skeletonImage} />
            <div style={styles.skeletonText} />
            <div style={styles.skeletonTextShort} />
          </div>
        ))}
      </div>
    )
  }

  if (error || !products) {
    return (
      <div style={styles.error}>
        Unable to load products.{" "}
        <a
          href={`https://${SHOPIFY_STORE_DOMAIN}`}
          target="_blank"
          rel="noopener noreferrer"
          style={styles.errorLink}
        >
          Visit Store →
        </a>
      </div>
    )
  }

  return (
    <div style={styles.grid}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

export function ProductShowcase({ handle }: { handle: string }) {
  const { data: product, isLoading, error } = useQuery({
    queryKey: ["shopify-product", handle],
    queryFn: () => getProductByHandle(handle),
    staleTime: 1000 * 60 * 5,
  })

  if (isLoading) {
    return (
      <div style={styles.showcaseLoading}>
        <div style={styles.skeletonLarge} />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div style={styles.error}>
        Product not found.{" "}
        <a
          href={`https://${SHOPIFY_STORE_DOMAIN}`}
          target="_blank"
          rel="noopener noreferrer"
          style={styles.errorLink}
        >
          Visit Store →
        </a>
      </div>
    )
  }

  const price = product.priceRange.minVariantPrice
  const variant = product.variants.edges[0]?.node

  return (
    <div style={styles.showcase}>
      <div style={styles.showcaseGrid}>
        <div style={styles.showcaseImages}>
          {product.images.edges.map((edge, i) => (
            <img
              key={i}
              src={edge.node.url}
              alt={edge.node.altText || product.title}
              style={styles.showcaseImage}
            />
          ))}
        </div>
        <div style={styles.showcaseInfo}>
          <h2 style={styles.showcaseTitle}>{product.title}</h2>
          <p style={styles.showcasePrice}>{formatPrice(price.amount, price.currencyCode)}</p>
          <p style={styles.showcaseDesc}>{product.description}</p>
          <div style={styles.showcaseActions}>
            {variant?.availableForSale ? (
              <a
                href={`https://${SHOPIFY_STORE_DOMAIN}/products/${product.handle}`}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.buyButtonLarge}
              >
                Buy Now
              </a>
            ) : (
              <span style={styles.soldOutLarge}>Sold Out</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: "16px",
    padding: "16px 0",
  },
  card: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    overflow: "hidden",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  imageWrapper: {
    width: "100%",
    aspectRatio: "1",
    overflow: "hidden",
    background: "var(--bg)",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  imagePlaceholder: {
    width: "100%",
    aspectRatio: "1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--bg)",
    color: "var(--muted)",
    fontSize: "12px",
  },
  content: {
    padding: "12px",
  },
  title: {
    fontSize: "14px",
    fontWeight: 700,
    color: "var(--text)",
    margin: "0 0 4px 0",
  },
  description: {
    fontSize: "12px",
    color: "var(--muted)",
    margin: "0 0 12px 0",
    lineHeight: 1.4,
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    fontSize: "16px",
    fontWeight: 700,
    color: "var(--accent)",
  },
  buyButton: {
    padding: "6px 12px",
    background: "var(--accent)",
    color: "#fff",
    borderRadius: "4px",
    textDecoration: "none",
    fontSize: "12px",
    fontWeight: 600,
  },
  soldOut: {
    fontSize: "11px",
    color: "var(--muted)",
    fontStyle: "italic",
  },
  skeleton: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    padding: "12px",
  },
  skeletonImage: {
    width: "100%",
    aspectRatio: "1",
    background: "var(--border)",
    borderRadius: "4px",
    marginBottom: "12px",
  },
  skeletonText: {
    height: "16px",
    background: "var(--border)",
    borderRadius: "4px",
    marginBottom: "8px",
    width: "80%",
  },
  skeletonTextShort: {
    height: "14px",
    background: "var(--border)",
    borderRadius: "4px",
    width: "50%",
  },
  skeletonLarge: {
    width: "100%",
    aspectRatio: "16/9",
    background: "var(--border)",
    borderRadius: "8px",
  },
  error: {
    textAlign: "center" as const,
    padding: "32px",
    color: "var(--muted)",
  },
  errorLink: {
    color: "var(--accent)",
  },
  showcaseLoading: {
    padding: "24px 0",
  },
  showcase: {
    padding: "24px 0",
  },
  showcaseGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "32px",
  },
  showcaseImages: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
  },
  showcaseImage: {
    width: "100%",
    borderRadius: "8px",
  },
  showcaseInfo: {
    padding: "16px 0",
  },
  showcaseTitle: {
    fontSize: "24px",
    fontWeight: 700,
    color: "var(--text)",
    margin: "0 0 8px 0",
  },
  showcasePrice: {
    fontSize: "28px",
    fontWeight: 700,
    color: "var(--accent)",
    margin: "0 0 16px 0",
  },
  showcaseDesc: {
    fontSize: "14px",
    color: "var(--muted)",
    lineHeight: 1.6,
    margin: "0 0 24px 0",
  },
  showcaseActions: {
    display: "flex",
    gap: "12px",
  },
  buyButtonLarge: {
    padding: "12px 24px",
    background: "var(--accent)",
    color: "#fff",
    borderRadius: "6px",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: 600,
  },
  soldOutLarge: {
    padding: "12px 24px",
    background: "var(--border)",
    color: "var(--muted)",
    borderRadius: "6px",
    fontSize: "14px",
  },
}