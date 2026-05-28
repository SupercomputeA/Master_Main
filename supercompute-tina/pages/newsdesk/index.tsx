import Head from 'next/head'
import Link from 'next/link'
import styles from '@/styles/Home.module.css'

interface Post {
  slug: string
  title: string
  date: string
  category: string
  author: string
  excerpt: string
  body?: string
}

export default function NewsDesk({ posts }: { posts: Post[] }) {
  const categories = ['ALL', 'INTELLIGENCE', 'SOVEREIGNTY', 'DISPATCH', 'SIGNAL']
  return (
    <>
      <Head>
        <title>NewsDesk — Supercompute</title>
      </Head>
      <div className={styles.container}>
        <nav className={styles.nav}>
          <div className={styles.navBrand}>// NEWSDESK</div>
          <div className={styles.navLinks}>
            <Link href="/">Home</Link>
            <Link href="/school">School</Link>
            <Link href="/consulting">Consulting</Link>
            <Link href="/app/dashboard">Dashboard</Link>
          </div>
        </nav>
        <div style={{ padding: '3rem 2rem', maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontFamily: 'var(--font-d)', fontSize: '2.5rem', color: 'var(--gold)', marginBottom: '0.5rem' }}>
              // NEWSROOM
            </h1>
            <p style={{ color: 'var(--muted)', fontFamily: 'var(--font-m)', fontSize: '0.8rem' }}>
              Decentralized journalism infrastructure. Intelligence, sovereignty, dispatch, signal.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button key={cat} style={{
                fontFamily: 'var(--font-m)', fontSize: '0.7rem', letterSpacing: '0.1em',
                padding: '0.4rem 0.85rem', border: '1px solid var(--border)',
                borderRadius: '4px', color: 'var(--muted)', background: 'transparent', cursor: 'pointer',
              }}>{cat}</button>
            ))}
          </div>
          <div className={styles.grid3}>
            {posts.map(post => (
              <Link key={post.slug} href={`/newsdesk/${post.slug}`} className={styles.postCard}>
                <div className={styles.postMeta}>
                  <span className={styles.postCategory}>[{post.category}]</span>
                  <span className={styles.postDate}>{new Date(post.date).toLocaleDateString()}</span>
                </div>
                <h3 className={styles.postTitle}>{post.title}</h3>
                <p className={styles.postExcerpt}>{post.excerpt}</p>
                <div className={styles.postAuthor}>// {post.author}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export async function getStaticProps() {
  const posts: Post[] = [
    { slug: 'welcome-to-supercompute', title: 'Welcome to Supercompute', date: '2026-05-19', category: 'INTELLIGENCE', author: 'Quanta Sovereigna', excerpt: 'The sovereign compute platform is live. Here is what you need to know.' },
    { slug: 'token-gating-deep-dive', title: 'Token Gating: How $QUANTA Powers Access', date: '2026-05-18', category: 'SIGNAL', author: 'Hermes', excerpt: 'A technical breakdown of how community tokens gate access to member-only features.' },
    { slug: 'newsdesk-launch', title: 'NewsDesk is Live', date: '2026-05-17', category: 'DISPATCH', author: 'NewsDesk Lead', excerpt: 'Decentralized journalism infrastructure for the on-chain era.' },
    { slug: 'on-chain-identity', title: 'On-Chain Identity with ENS', date: '2026-05-16', category: 'SOVEREIGNTY', author: 'Quanta Sovereigna', excerpt: 'How ENS resolution powers sovereign identity in the Supercompute ecosystem.' },
  ]
  return { props: { posts } }
}