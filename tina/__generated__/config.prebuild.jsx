// tina/config.ts
import { defineConfig } from "tinacms";
var config_default = defineConfig({
  branch: process.env.TINA_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || process.env.HEAD || "main",
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID || "b77cb4b2-e33c-47ed-a714-7a7613e614bc",
  token: process.env.TINA_TOKEN || process.env.NEXT_PUBLIC_TINA_TOKEN || "x",
  build: {
    outputFolder: "admin",
    publicFolder: "public"
  },
  media: {
    tina: {
      mediaRoot: "uploads",
      publicFolder: "public"
    }
  },
  schema: {
    collections: [
      {
        name: "post",
        label: "NewsDesk Articles",
        path: "content/posts",
        format: "md",
        fields: [
          { type: "string", name: "title", label: "Title", isTitle: true, required: true },
          { type: "string", name: "slug", label: "Slug", required: true },
          {
            type: "string",
            name: "category",
            label: "Category",
            options: ["INTELLIGENCE", "SOVEREIGNTY", "DISPATCH", "SIGNAL", "PROTOCOL_EVAL"]
          },
          { type: "string", name: "author", label: "Author" },
          { type: "datetime", name: "date", label: "Date" },
          { type: "string", name: "excerpt", label: "Excerpt", ui: { component: "textarea" } },
          {
            type: "string",
            name: "access",
            label: "Access",
            options: ["public", "subscriber"]
          },
          {
            type: "string",
            name: "status",
            label: "Status",
            options: ["draft", "review", "published"]
          },
          { type: "rich-text", name: "body", label: "Body", isBody: true },
          { type: "string", name: "kgQuery", label: "Memgraph Query (for memgraph template)" },
          {
            type: "object",
            name: "seo",
            label: "SEO Metadata",
            fields: [
              { type: "string", name: "title", label: "SEO Title" },
              { type: "string", name: "description", label: "Meta Description", ui: { component: "textarea" } },
              { type: "string", name: "keywords", label: "Keywords (comma separated)" },
              { type: "string", name: "ogImage", label: "OG Image URL" }
            ]
          },
          {
            type: "object",
            name: "knowledgeGraph",
            label: "Knowledge Graph",
            fields: [
              {
                type: "object",
                name: "nodes",
                label: "Nodes",
                list: true,
                fields: [
                  { type: "string", name: "id", label: "ID" },
                  { type: "string", name: "label", label: "Label" },
                  {
                    type: "string",
                    name: "type",
                    label: "Type",
                    options: ["protocol", "token", "agent", "concept", "person", "term", "date", "event", "narrative", "image"]
                  },
                  { type: "string", name: "description", label: "Description", ui: { component: "textarea" } },
                  { type: "string", name: "definition", label: "Definition (for term nodes)", ui: { component: "textarea" } },
                  { type: "datetime", name: "datetime", label: "Date/Time (for date/event nodes)" },
                  { type: "string", name: "location", label: "Location (for event nodes)" },
                  { type: "string", name: "src", label: "Image URL (for image nodes)" },
                  { type: "string", name: "alt", label: "Image Alt Text" },
                  { type: "number", name: "order", label: "Order (for narrative nodes)" },
                  { type: "string", name: "prompt", label: "Narrative Prompt", ui: { component: "textarea" } }
                ]
              },
              {
                type: "object",
                name: "edges",
                label: "Edges",
                list: true,
                fields: [
                  { type: "string", name: "from", label: "From" },
                  { type: "string", name: "to", label: "To" },
                  { type: "string", name: "label", label: "Label" },
                  { type: "number", name: "weight", label: "Weight (editorial gravity, default 1)" }
                ]
              },
              {
                type: "object",
                name: "presets",
                label: "Preset Views",
                list: true,
                fields: [
                  { type: "string", name: "id", label: "ID" },
                  { type: "string", name: "label", label: "Label" },
                  { type: "string", name: "description", label: "Description" },
                  { type: "string", name: "filters", label: "Node Types (comma separated)" },
                  { type: "string", name: "highlightIds", label: "Highlight Node IDs (comma separated)" },
                  { type: "string", name: "focusNodeId", label: "Focus Node ID" }
                ]
              },
              {
                type: "object",
                name: "narratives",
                label: "Narratives",
                list: true,
                fields: [
                  { type: "string", name: "id", label: "ID" },
                  { type: "string", name: "title", label: "Title" },
                  { type: "string", name: "description", label: "Description" },
                  { type: "string", name: "steps", label: "Node IDs (comma separated, in order)" }
                ]
              }
            ]
          },
          {
            type: "object",
            name: "protocolEval",
            label: "Protocol Evaluation",
            fields: [
              { type: "string", name: "protocol", label: "Protocol Name" },
              { type: "string", name: "chain", label: "Chain" },
              { type: "string", name: "tvl", label: "TVL" },
              {
                type: "string",
                name: "riskScore",
                label: "Risk Score",
                options: ["Low", "Medium", "High", "Critical"]
              },
              { type: "string", name: "audit", label: "Audit Info" },
              {
                type: "string",
                name: "recommendation",
                label: "Recommendation",
                options: ["Invest", "Monitor", "Caution", "Avoid"]
              },
              { type: "string", name: "category", label: "Category" },
              { type: "string", name: "auditedBy", label: "Audited By" },
              { type: "string", name: "launchDate", label: "Launch Date" }
            ]
          }
        ]
      },
      {
        name: "service",
        label: "Services",
        path: "content/services",
        format: "json",
        fields: [
          { type: "string", name: "title", label: "Title", isTitle: true, required: true },
          { type: "string", name: "description", label: "Description", ui: { component: "textarea" } },
          { type: "string", name: "price", label: "Price" },
          { type: "string", name: "duration", label: "Duration" }
        ]
      },
      {
        name: "project",
        label: "Projects",
        path: "content/projects",
        format: "json",
        fields: [
          { type: "string", name: "slug", label: "Slug (URL ID)", required: true },
          { type: "string", name: "title", label: "Title", isTitle: true, required: true },
          { type: "string", name: "tagline", label: "Tagline" },
          { type: "string", name: "description", label: "Description", ui: { component: "textarea" } },
          { type: "string", name: "category", label: "Category", options: ["Agent", "Protocol", "DeFi", "Infrastructure", "Tool"] },
          { type: "string", name: "status", label: "Status", options: ["Active", "Beta", "Building", "Planning"] },
          { type: "string", name: "chain", label: "Chain(s)" },
          { type: "number", name: "agents", label: "Agent Count" },
          { type: "string", name: "tokenSymbol", label: "Token Symbol (e.g. $QNTA)" },
          { type: "string", name: "tokenName", label: "Token Name" },
          { type: "string", name: "tokenAddress", label: "Token Contract Address" },
          { type: "string", name: "tokenPrice", label: "Token Price (display)" },
          { type: "string", name: "tvl", label: "TVL (display)" },
          { type: "number", name: "goal", label: "Fundraise Goal (USD)" },
          { type: "number", name: "raised", label: "Amount Raised (USD)" },
          { type: "number", name: "investors", label: "Investor Count" },
          { type: "number", name: "progress", label: "Progress %" },
          { type: "number", name: "scomRequired", label: "$SCOM Required to Invest" },
          {
            type: "object",
            name: "updates",
            label: "Project Updates",
            list: true,
            ui: {
              itemProps: (item) => ({ label: `${item.date || ""} \u2014 ${item.from || ""}` })
            },
            fields: [
              { type: "string", name: "from", label: "From" },
              { type: "datetime", name: "date", label: "Date" },
              { type: "string", name: "text", label: "Text", ui: { component: "textarea" } },
              { type: "string", name: "type", label: "Type", options: ["agent", "admin", "milestone", "release", "incident"] }
            ]
          }
        ]
      },
      {
        name: "agent",
        label: "Agents",
        path: "content/agents",
        format: "json",
        fields: [
          { type: "string", name: "title", label: "Name", isTitle: true, required: true },
          { type: "string", name: "role", label: "Role" },
          { type: "string", name: "status", label: "Status", options: ["online", "observer", "dev", "queued"] },
          { type: "string", name: "description", label: "Description", ui: { component: "textarea" } }
        ]
      },
      {
        name: "schoolModule",
        label: "School Modules",
        path: "content/school",
        format: "json",
        fields: [
          { type: "string", name: "moduleId", label: "Module ID (e.g. WS-01)", required: true },
          { type: "string", name: "title", label: "Title", isTitle: true, required: true },
          { type: "string", name: "subtitle", label: "Subtitle" },
          { type: "string", name: "description", label: "Description", ui: { component: "textarea" } },
          { type: "string", name: "difficulty", label: "Difficulty", options: ["Beginner", "Intermediate", "Advanced"] },
          { type: "string", name: "access", label: "Access", options: ["free", "member"] },
          { type: "string", name: "duration", label: "Duration" },
          { type: "string", name: "credential", label: "Credential" },
          { type: "string", name: "icon", label: "Icon (emoji)" },
          { type: "string", name: "color", label: "Accent Color (hex)" },
          { type: "boolean", name: "done", label: "Available?" },
          {
            type: "object",
            name: "lessons",
            label: "Lessons",
            list: true,
            ui: {
              itemProps: (item) => ({ label: `${item.id || ""} \u2014 ${item.title || ""}` })
            },
            fields: [
              { type: "string", name: "id", label: "Lesson ID" },
              { type: "string", name: "title", label: "Title" },
              { type: "string", name: "description", label: "Description", ui: { component: "textarea" } },
              { type: "string", name: "duration", label: "Duration" },
              { type: "string", name: "topics", label: "Topics (comma separated)" }
            ]
          }
        ]
      }
    ]
  }
});
export {
  config_default as default
};
