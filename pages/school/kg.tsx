import type { GetStaticProps } from "next"
import PublicLayout from "../../components/PublicLayout"
import Footer from "../../components/Footer"
import KgTemplate, { type KgGraph } from "../../components/kg/KgTemplate"

/* Web3 School — first EXPORT of the KG working template.
   Same renderer as the articles template, school graph data:
   - SVG map ← school modules (module type, hub = first module)
   - Release ladder ← level ladder (Beginner → Intermediate → Advanced)
   - No timeline/people/debate/comments in school data yet → sections auto-hide.
   Data source: /api/kg/graph?graph=school (Memgraph live → seed fallback). */

const SCHOOL_FALLBACK: KgGraph = {
  nodes: [
    { id: "sc-01", label: "Sovereign Compute", type: "module", level: "beginner", description: "Foundations of sovereign compute on Base Chain" },
    { id: "ws-01", label: "Wallet Security", type: "module", level: "beginner", description: "Create and secure your first crypto wallet" },
    { id: "df-01", label: "DeFi Fundamentals", type: "module", level: "intermediate", description: "AMMs, lending pools, yield strategies" },
    { id: "tk-01", label: "Token Economics", type: "module", level: "intermediate", description: "Token design, distribution, governance" },
    { id: "pg-01", label: "Protocol Governance", type: "module", level: "advanced", description: "DAO structures, proposal frameworks" },
    { id: "lq-01", label: "Liquidity Pools", type: "module", level: "advanced", description: "LP mechanics, concentrated liquidity" },
    { id: "rf-01", label: "Refi & Regenerative Finance", type: "module", level: "advanced", description: "Regenerative finance, impact measurement" },
    { id: "cv-01", label: "Community Building", type: "module", level: "intermediate", description: "Token-gated communities, DAO tooling" },
    { id: "as-01", label: "Agent Systems", type: "module", level: "advanced", description: "AI agent deployment, autonomous ops" },
  ],
  edges: [
    ["sc-01", "ws-01"], ["ws-01", "df-01"], ["df-01", "tk-01"],
    ["df-01", "pg-01"], ["df-01", "lq-01"], ["tk-01", "rf-01"],
    ["pg-01", "cv-01"], ["lq-01", "rf-01"], ["df-01", "as-01"],
  ],
}

export const getStaticProps: GetStaticProps = async () => ({ props: {} })

export default function SchoolKg() {
  return (
    <PublicLayout title="SUPERCOMPUTE · Web3 School KG">
      <div style={{ minHeight: "70vh", padding: "48px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <KgTemplate
          config={{
            graphId: "school",
            title: "Web3 School — Knowledge Graph",
            eyebrow: "Knowledge Graph · School · Curriculum",
            meta: { author: "School · SUPERCOMPUTE", date: "2026", entry: "9 modules", read: "3 levels" },
            hubType: "module",
            fallback: SCHOOL_FALLBACK,
            levelLadder: [
              { level: "beginner", label: "Beginner" },
              { level: "intermediate", label: "Intermediate" },
              { level: "advanced", label: "Advanced" },
            ],
            levelBadge: lv => lv.slice(0, 1).toUpperCase() + lv.slice(1),
          }}
        />
      </div>
      <Footer />
    </PublicLayout>
  )
}
