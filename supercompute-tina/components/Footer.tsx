export default function Footer() {
  return (
    <footer>
      <div className="footer-grid">
        <div className="footer-brand">
          <a href="#" className="logo">SUPERCOMPUTE</a>
          <p>One operator. Hands-on Web3 consulting on Base Chain since 2013.</p>
        </div>
        <div className="footer-links">
          <div className="link-col">
            <div className="label-sm">Practice</div>
            <ul>
              <li><a href="#consulting">Consulting</a></li>
              <li><a href="#fleet">Agent Fleet</a></li>
              <li><a href="#newsdesk">NewsDesk</a></li>
              <li><a href="#school">Web3 School</a></li>
            </ul>
          </div>
          <div className="link-col">
            <div className="label-sm">Publishing</div>
            <ul>
              <li><a href="#">Blog</a></li>
              <li><a href="#">$SCOM Token</a></li>
              <li><a href="#">Agent Chat</a></li>
              <li><a href="#">Shop</a></li>
            </ul>
          </div>
          <div className="link-col">
            <div className="label-sm">Connect</div>
            <ul>
              <li><a href="#">Calendly</a></li>
              <li><a href="#">@supercompute_io</a></li>
              <li><a href="#">Farcaster</a></li>
              <li><a href="#">supercompute.eth</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="footer-copy">&copy; 2026 Supercompute · Phase 1 · Base Chain // uptime → 99.9% · since May 2026</div>
        <div className="footer-social">
          <a href="#">X</a>
          <a href="#">Farcaster</a>
          <a href="#">Calendly</a>
        </div>
      </div>
    </footer>
  )
}
