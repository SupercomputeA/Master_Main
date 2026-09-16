import Head from "next/head"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import PublicLayout from "../components/PublicLayout"
import Footer from "../components/Footer"
import { useAuth } from "../lib/auth"

/* /sell — owner-gated listing form. SIWE required.
   Posts to /api/marketplace/list with a Bearer session.
   Defaults: chain=base, license=commercial, deliverableKind=file. */

type FieldErrors = Partial<Record<
  "title" | "description" | "priceUsdc" | "deliverableUrl" | "splitAddress" | "licenseText" | "form",
  string
>>

type SubmitState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "error"; message: string }
  | { kind: "success"; listingId: string }

const LICENSE_OPTIONS = [
  { value: "commercial", label: "Commercial — full commercial rights" },
  { value: "cc-by",      label: "CC-BY — credit required" },
  { value: "cc0",        label: "CC0 — public domain" },
  { value: "custom",     label: "Custom — provide text" },
]

const CATEGORY_OPTIONS = [
  { value: "",           label: "(unspecified)" },
  { value: "app",        label: "App" },
  { value: "agent",      label: "Agent" },
  { value: "data",       label: "Data" },
  { value: "course",     label: "Course" },
  { value: "design",     label: "Design" },
  { value: "service",    label: "Service" },
]

const CHAIN_OPTIONS = [
  { value: "base",      label: "Base — USDC 0x8335…29913" },
  { value: "robinhood", label: "Robinhood Chain — stable TBD" },
]

const DELIVERABLE_KINDS = [
  { value: "file", label: "File (R2 URL)" },
  { value: "link", label: "External link" },
  { value: "memo", label: "Memo (tx hash = receipt)" },
]

export default function SellPage() {
  const router = useRouter()
  const { profile, session, connect } = useAuth()
  const isAuthenticated = !!session
  const [title, setTitle] = useState("")
  const [tagline, setTagline] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [chain, setChain] = useState("base")
  const [priceDollars, setPriceDollars] = useState("25")  // user input in $
  const [priceStockSymbol, setPriceStockSymbol] = useState("")
  const [priceStockAmount, setPriceStockAmount] = useState("")
  const [splitAddress, setSplitAddress] = useState("")
  const [splitRecipient, setSplitRecipient] = useState("")  // single recipient for simplicity
  const [splitPercent, setSplitPercent] = useState("10000") // bps; default 100% to seller
  const [deliverableKind, setDeliverableKind] = useState("file")
  const [deliverableUrl, setDeliverableUrl] = useState("")
  const [license, setLicense] = useState("commercial")
  const [licenseText, setLicenseText] = useState("")
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submit, setSubmit] = useState<SubmitState>({ kind: "idle" })

  // If not authed, show CTA instead of form (preserves SSR safety).
  const ready = isAuthenticated

  function dollarsToUsdc(d: string): string {
    const n = Number(d)
    if (!Number.isFinite(n) || n <= 0) return ""
    return Math.round(n * 1_000_000).toString()
  }

  function validate(): FieldErrors {
    const e: FieldErrors = {}
    if (title.trim().length < 3) e.title = "Min 3 chars."
    if (description.trim().length < 10) e.description = "Min 10 chars."
    const priceUsdc = dollarsToUsdc(priceDollars)
    if (!priceUsdc || !/^\d{1,12}$/.test(priceUsdc)) e.priceUsdc = "Enter a positive dollar amount."
    if (deliverableKind === "file" && !deliverableUrl.trim()) e.deliverableUrl = "File URL is required."
    if (deliverableKind === "link" && !/^https?:\/\//.test(deliverableUrl.trim())) e.deliverableUrl = "Must start with http(s)://"
    if (splitAddress && !/^0x[a-fA-F0-9]{40}$/.test(splitAddress)) e.splitAddress = "Invalid address (0x + 40 hex)."
    if (license === "custom" && licenseText.trim().length < 5) e.licenseText = "License text required."
    return e
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length > 0) return

    const session = typeof window !== "undefined" ? localStorage.getItem("session") : null
    if (!session) {
      setErrors({ form: "Session missing — sign in again." })
      return
    }

    const body = {
      title: title.trim(),
      tagline: tagline.trim() || null,
      description: description.trim(),
      category: category || null,
      chain,
      priceUsdc: dollarsToUsdc(priceDollars),
      priceStock: priceStockSymbol && priceStockAmount
        ? { symbol: priceStockSymbol.trim().toUpperCase(), amount: priceStockAmount.trim() }
        : null,
      splitAddress: splitAddress.trim() || null,
      splitRecipients: splitRecipient
        ? [{ address: splitRecipient.trim(), percentBps: Number(splitPercent) || 0 }]
        : null,
      deliverableKind,
      deliverableUrl: deliverableUrl.trim() || null,
      license,
      licenseText: license === "custom" ? licenseText.trim() : null,
      status: "live",
    }

    setSubmit({ kind: "submitting" })
    try {
      const res = await fetch("/api/marketplace/list", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session}` },
        body: JSON.stringify(body),
      })
      const data = (await res.json()) as { error?: string; listing?: { id: string } }
      if (!res.ok) {
        setSubmit({ kind: "error", message: data?.error || `Server error (${res.status})` })
        return
      }
      setSubmit({ kind: "success", listingId: data.listing?.id || "" })
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error"
      setSubmit({ kind: "error", message: msg })
    }
  }

  // After successful create, send the user to the detail page
  useEffect(() => {
    if (submit.kind === "success" && submit.listingId) {
      const t = setTimeout(() => router.push(`/project/${submit.listingId}`), 1200)
      return () => clearTimeout(t)
    }
  }, [submit, router])

  return (
    <PublicLayout title="SUPERCOMPUTE · Sell" wide>
      <Head>
        <title>SUPERCOMPUTE · List a project</title>
      </Head>

      <div className="vignette" />

      <main className="mp-shell">
        <header className="mp-header">
          <div className="eyebrow">./sell --list-project<span className="caret" /></div>
          <h1 className="mp-title">List a project</h1>
          <p className="mp-sub">
            Set a USDC price, choose a license, and point at the deliverable. Buyers pay
            with EIP-3009 transferWithAuthorization. Splits route via 0xSplits.
          </p>
        </header>

        {!ready && (
          <section className="mp-empty mp-empty-narrow">
            <div className="eyebrow">// auth required<span className="caret" /></div>
            <h2>Sign in to list.</h2>
            <p>
              You need a connected wallet (Base or Robinhood Chain) to publish a listing.
              Your wallet is the seller identity — buyers pay you directly.
            </p>
            <button
              type="button"
              className="btn-cta btn-cta-gold"
              onClick={() => connect()}
            >
              // Connect wallet
            </button>
            <p className="mp-sub-dim">
              No wallet? <Link href="/auth">// full sign-in flow</Link>
            </p>
          </section>
        )}

        {ready && submit.kind === "success" && (
          <section className="mp-success">
            <div className="eyebrow">// published<span className="caret" /></div>
            <h2>Listing live.</h2>
            <p>Redirecting to the project page…</p>
            <code className="mp-success-id">id: {submit.listingId}</code>
          </section>
        )}

        {ready && submit.kind !== "success" && (
          <form className="mp-form" onSubmit={onSubmit} noValidate>
            <fieldset className="mp-fieldset">
              <legend>// basics</legend>

              <label className="mp-field">
                <span className="mp-field-label">title <em>*</em></span>
                <input
                  className="mp-input"
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. KNIGHT v1 — Trading Agent"
                  maxLength={120}
                />
                {errors.title && <span className="mp-err">{errors.title}</span>}
              </label>

              <label className="mp-field">
                <span className="mp-field-label">tagline</span>
                <input
                  className="mp-input"
                  type="text"
                  value={tagline}
                  onChange={e => setTagline(e.target.value)}
                  placeholder="One-line hook"
                  maxLength={160}
                />
              </label>

              <label className="mp-field">
                <span className="mp-field-label">description <em>*</em></span>
                <textarea
                  className="mp-input mp-textarea"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="What is this? What's included? What's it for?"
                  rows={6}
                  maxLength={4000}
                />
                {errors.description && <span className="mp-err">{errors.description}</span>}
              </label>

              <div className="mp-row">
                <label className="mp-field mp-field-half">
                  <span className="mp-field-label">category</span>
                  <select className="mp-select" value={category} onChange={e => setCategory(e.target.value)}>
                    {CATEGORY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </label>
                <label className="mp-field mp-field-half">
                  <span className="mp-field-label">chain</span>
                  <select className="mp-select" value={chain} onChange={e => setChain(e.target.value)}>
                    {CHAIN_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </label>
              </div>
            </fieldset>

            <fieldset className="mp-fieldset">
              <legend>// price</legend>

              <div className="mp-row">
                <label className="mp-field mp-field-half">
                  <span className="mp-field-label">price (USDC) <em>*</em></span>
                  <div className="mp-input-prefix">
                    <span>$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={priceDollars}
                      onChange={e => setPriceDollars(e.target.value)}
                      placeholder="25.00"
                    />
                  </div>
                  {errors.priceUsdc && <span className="mp-err">{errors.priceUsdc}</span>}
                </label>
                <label className="mp-field mp-field-half">
                  <span className="mp-field-label">stock-token (optional)</span>
                  <div className="mp-row">
                    <input
                      className="mp-input"
                      type="text"
                      value={priceStockSymbol}
                      onChange={e => setPriceStockSymbol(e.target.value)}
                      placeholder="TSLA"
                      maxLength={8}
                      style={{ width: "30%" }}
                    />
                    <input
                      className="mp-input"
                      type="text"
                      value={priceStockAmount}
                      onChange={e => setPriceStockAmount(e.target.value)}
                      placeholder="1.5"
                      style={{ width: "65%" }}
                    />
                  </div>
                </label>
              </div>
            </fieldset>

            <fieldset className="mp-fieldset">
              <legend>// delivery</legend>

              <div className="mp-row">
                <label className="mp-field mp-field-half">
                  <span className="mp-field-label">deliverable kind</span>
                  <select className="mp-select" value={deliverableKind} onChange={e => setDeliverableKind(e.target.value)}>
                    {DELIVERABLE_KINDS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </label>
                <label className="mp-field mp-field-half">
                  <span className="mp-field-label">
                    {deliverableKind === "file" ? "R2 URL / path" :
                     deliverableKind === "link" ? "External URL" :
                     "(none — tx hash is receipt)"}
                  </span>
                  <input
                    className="mp-input"
                    type="text"
                    value={deliverableUrl}
                    onChange={e => setDeliverableUrl(e.target.value)}
                    placeholder={
                      deliverableKind === "file" ? "projects/knight-v1.zip" :
                      deliverableKind === "link" ? "https://…" :
                      "leave empty"
                    }
                    disabled={deliverableKind === "memo"}
                  />
                  {errors.deliverableUrl && <span className="mp-err">{errors.deliverableUrl}</span>}
                </label>
              </div>
            </fieldset>

            <fieldset className="mp-fieldset">
              <legend>// royalty split (optional)</legend>

              <div className="mp-row">
                <label className="mp-field mp-field-half">
                  <span className="mp-field-label">split contract (0xSplits)</span>
                  <input
                    className="mp-input"
                    type="text"
                    value={splitAddress}
                    onChange={e => setSplitAddress(e.target.value)}
                    placeholder="0x… (leave blank to use SPLIT_MAIN env)"
                  />
                  {errors.splitAddress && <span className="mp-err">{errors.splitAddress}</span>}
                </label>
                <label className="mp-field mp-field-quarter">
                  <span className="mp-field-label">recipient</span>
                  <input
                    className="mp-input"
                    type="text"
                    value={splitRecipient}
                    onChange={e => setSplitRecipient(e.target.value)}
                    placeholder="0x…"
                  />
                </label>
                <label className="mp-field mp-field-quarter">
                  <span className="mp-field-label">share (bps)</span>
                  <input
                    className="mp-input"
                    type="number"
                    min="0"
                    max="10000"
                    value={splitPercent}
                    onChange={e => setSplitPercent(e.target.value)}
                  />
                  <span className="mp-field-hint">10000 = 100%</span>
                </label>
              </div>
              <p className="mp-sub-dim">
                Until 0xSplits is wired (t_adc8d3f8), splits run in dry-run. Your listing is
                still live; the on-chain distribute call is queued for the split cron.
              </p>
            </fieldset>

            <fieldset className="mp-fieldset">
              <legend>// license</legend>

              <label className="mp-field">
                <span className="mp-field-label">license type</span>
                <select className="mp-select" value={license} onChange={e => setLicense(e.target.value)}>
                  {LICENSE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </label>

              {license === "custom" && (
                <label className="mp-field">
                  <span className="mp-field-label">license text <em>*</em></span>
                  <textarea
                    className="mp-input mp-textarea"
                    value={licenseText}
                    onChange={e => setLicenseText(e.target.value)}
                    placeholder="Describe the license terms…"
                    rows={4}
                    maxLength={4000}
                  />
                  {errors.licenseText && <span className="mp-err">{errors.licenseText}</span>}
                </label>
              )}
            </fieldset>

            {errors.form && (
              <div className="mp-error">
                <strong>// submit failed</strong>
                <div>{errors.form}</div>
              </div>
            )}
            {submit.kind === "error" && (
              <div className="mp-error">
                <strong>// server error</strong>
                <div>{submit.message}</div>
              </div>
            )}

            <div className="mp-form-foot">
              <button
                type="submit"
                className="btn-cta btn-cta-gold"
                disabled={submit.kind === "submitting"}
              >
                {submit.kind === "submitting" ? "// publishing…" : "// Publish listing"}
              </button>
              <Link href="/marketplace" className="btn-cta btn-cta-ghost">// Cancel</Link>
            </div>
          </form>
        )}
      </main>

      <Footer />
    </PublicLayout>
  )
}