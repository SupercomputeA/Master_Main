const SHOPIFY_STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || "supercompute.myshopify.com"
const SHOPIFY_STOREFRONT_API = `https://${SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`

export interface ShopifyProduct {
  id: string
  title: string
  description: string
  handle: string
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string }
  }
  images: { edges: { node: { url: string; altText: string } }[] }
  variants: {
    edges: {
      node: {
        id: string
        title: string
        price: { amount: string; currencyCode: string }
        availableForSale: boolean
      }
    }[]
  }
}

const GET_PRODUCTS_QUERY = `
  query GetProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          description
          handle
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 1) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 10) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
                availableForSale
              }
            }
          }
        }
      }
    }
  }
`

const GET_PRODUCT_BY_HANDLE_QUERY = `
  query GetProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      title
      description
      handle
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 5) {
        edges {
          node {
            url
            altText
          }
        }
      }
      variants(first: 10) {
        edges {
          node {
            id
            title
            price {
              amount
              currencyCode
            }
            availableForSale
          }
        }
      }
    }
  }
`

async function shopifyFetch<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch(SHOPIFY_STOREFRONT_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN || "",
    },
    body: JSON.stringify({ query, variables }),
  })
  if (!res.ok) throw new Error(`Shopify API error: ${res.status}`)
  const json = await res.json() as { errors?: unknown[]; data: T }
  if (json.errors) throw new Error(`Shopify GraphQL error: ${JSON.stringify(json.errors)}`)
  return json.data
}

interface ProductsResponse {
  products: {
    edges: { node: ShopifyProduct }[]
  }
}

interface ProductResponse {
  product: ShopifyProduct | null
}

export async function getProducts(first = 20): Promise<ShopifyProduct[]> {
  const data = await shopifyFetch<ProductsResponse>(GET_PRODUCTS_QUERY, { first })
  return data.products.edges.map((e) => e.node)
}

export async function getProductByHandle(handle: string): Promise<ShopifyProduct | null> {
  const data = await shopifyFetch<ProductResponse>(GET_PRODUCT_BY_HANDLE_QUERY, { handle })
  return data.product
}

export function formatPrice(amount: string, currencyCode = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(parseFloat(amount))
}