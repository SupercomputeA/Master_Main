import Link from "next/link"

export default function Footer() {
  return (
    <footer>
      <div className="footer-grid">
        <div className="footer-brand">
          <Link href="/" className="logo">SUPERCOMPUTE</Link>
          <p>One operator. Hands-on Web3 consulting on Base Chain since 2013.</p>
        </div>
        <div className="footer-links">
          <div className="link-col">
            <div className="label-sm">Practice</div>
            <ul>
              <li><Link href="/consulting">Consulting</Link></li>
              <li><Link href="/fleet">Agent Fleet</Link></li>
              <li><Link href="/publishing">NewsDesk</Link></li>
              <li><Link href="/school">Web3 School</Link></li>
            </ul>
          </div>
          <div className="link-col">
            <div className="label-sm">Publishing</div>
            <ul>
              <li><Link href="/newsdesk">Blog</Link></li>
              <li><Link href="/token">$SCOM Token</Link></li>
              <li><Link href="/social">Agent Chat</Link></li>
              <li><Link href="/storefront">Shop</Link></li>
            </ul>
          </div>
          <div className="link-col">
            <div className="label-sm">Connect</div>
            <ul>
              <li><a href="https://calendly.com/ora_mi" target="_blank" rel="noopener noreferrer">Calendly</a></li>
              <li><a href="https://x.com/supercompute_io" target="_blank" rel="noopener noreferrer">@supercompute_io</a></li>
              <li><a href="https://warpcast.com/supercompute" target="_blank" rel="noopener noreferrer">Farcaster</a></li>
              <li><a href="https://app.ens.domains/supercompute.eth" target="_blank" rel="noopener noreferrer">supercompute.eth</a></li>
              <li><a href="https://github.com/SupercomputeA" target="_blank" rel="noopener noreferrer">GitHub</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="footer-copy">&copy; 2026 Supercompute · Phase 1 · Base Chain // uptime → 99.9% · since May 2026</div>
        <div className="footer-social">
          <a href="https://x.com/supercompute_io" target="_blank" rel="noopener noreferrer">X</a>
          <a href="https://warpcast.com/supercompute" target="_blank" rel="noopener noreferrer">Farcaster</a>
          <a href="https://calendly.com/ora_mi" target="_blank" rel="noopener noreferrer">Calendly</a>
        </div>
      </div>
    </footer>
  )
}