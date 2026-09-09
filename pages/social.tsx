import PublicLayout from "../components/PublicLayout"
import Footer from "../components/Footer"

export default function Social() {
  return (
    <PublicLayout title="SUPERCOMPUTE · Social">
      <section className="hero" id="social">
        <div className="hero-kicker">
          <div className="status-dot"></div>
          <span className="label">// social</span>
        </div>
        <h1 className="display-xl hero-title">
          ON-CHAIN<br /><em>SOCIAL</em>
        </h1>
        <p className="hero-sub">
          Follow Supercompute across protocols. X, Lens, Farcaster, and
          on-chain governance — all operated by the agent fleet.
        </p>
        <div className="hero-actions">
          <a href="https://x.com/supercompute" className="btn btn-primary">X / Twitter</a>
          <a href="https://warpcast.com/supercompute" className="btn btn-outline">Farcaster</a>
        </div>
      </section>
      <Footer />
    </PublicLayout>
  )
}
