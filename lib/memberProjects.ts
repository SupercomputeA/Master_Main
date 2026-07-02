/* Shared member-project data — used by the projects list, detail, and (as the
   default set) the create flow. Placeholder content until wired to the D1
   `projects` table (see schema.sql / src/api/projects). */

export interface MemberProject {
  slug: string
  icon: string
  name: string
  desc: string
  status: "active" | "paused"
  created: string
  collaborators: string[]
  tasks: { label: string; done: boolean }[]
  activity: { text: string; time: string }[]
}

export const MEMBER_PROJECTS: MemberProject[] = [
  {
    slug: "my-first-project",
    icon: "🎯",
    name: "My First Project",
    desc: "Active project exploring Web3 infrastructure and community governance patterns. Mapping the coordination surface between on-chain treasury, contributor incentives, and public roadmap.",
    status: "active",
    created: "3 weeks ago",
    collaborators: ["quanta_s", "knight"],
    tasks: [
      { label: "Draft governance charter", done: true },
      { label: "Deploy treasury multisig on Base", done: true },
      { label: "Open contributor onboarding", done: false },
      { label: "Publish public roadmap", done: false },
    ],
    activity: [
      { text: "knight joined the project", time: "2 days ago" },
      { text: "Treasury multisig deployed", time: "5 days ago" },
      { text: "Project created", time: "3 weeks ago" },
    ],
  },
  {
    slug: "product-launch",
    icon: "🚀",
    name: "Product Launch",
    desc: "Coordinating product development, marketing, and go-to-market strategy across the fleet. Target: public beta with wallet onboarding and a launch-day NewsDesk drop.",
    status: "active",
    created: "1 week ago",
    collaborators: ["quanta_s", "knight", "sarah_c", "james_r", "alex_t"],
    tasks: [
      { label: "Finalize launch messaging", done: true },
      { label: "Wire wallet onboarding flow", done: false },
      { label: "Schedule NewsDesk drop", done: false },
    ],
    activity: [
      { text: "5 collaborators added", time: "6 days ago" },
      { text: "Project created", time: "1 week ago" },
    ],
  },
  {
    slug: "research-initiative",
    icon: "📊",
    name: "Research Initiative",
    desc: "Data analysis and market research for protocol evaluation and insights. Building the evaluation framework the NewsDesk protocol-analysis series draws from.",
    status: "paused",
    created: "5 days ago",
    collaborators: ["quanta_s"],
    tasks: [
      { label: "Define evaluation rubric", done: true },
      { label: "Collect protocol dataset", done: false },
    ],
    activity: [
      { text: "Project paused", time: "1 day ago" },
      { text: "Project created", time: "5 days ago" },
    ],
  },
]

export function getMemberProject(slug: string): MemberProject | undefined {
  return MEMBER_PROJECTS.find((p) => p.slug === slug)
}
