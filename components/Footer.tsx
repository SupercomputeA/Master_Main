export default function Footer() {
  return (
    <footer>
      <div className="footer-grid">
        <div className="footer-brand">
          <a href="/" className="logo">SUPERCOMPUTE</a>
          <p>Agent-powered publishing. Write once, publish everywhere.</p>
        </div>
        <div className="footer-links">
          <div className="link-col">
            <div className="label-sm">Publish</div>
            <ul>
              <li><a href="/compose">Compose</a></li>
              <li><a href="/newsdesk">NewsDesk</a></li>
              <li><a href="/knowledge-graph">Entity Map</a></li>
            </ul>
          </div>
          <div className="link-col">
            <div className="label-sm">Export To</div>
            <ul>
              <li><a href="#">X / Twitter</a></li>
              <li><a href="#">Farcaster</a></li>
              <li><a href="#">Lens Protocol</a></li>
              <li><a href="#">Mirror</a></li>
            </ul>
          </div>
          <div className="link-col">
            <div className="label-sm">Connect</div>
            <ul>
              <li><a href="#">@supercompute_io</a></li>
              <li><a href="#">Farcaster</a></li>
              <li><a href="#">supercompute.eth</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="footer-copy">&copy; 2026 Supercompute Publishing · Base Chain · Agent-Powered</div>
        <div className="footer-social">
          <a href="#">X</a>
          <a href="#">Farcaster</a>
          <a href="#">Lens</a>
        </div>
      </div>
    </footer>
  )
}
