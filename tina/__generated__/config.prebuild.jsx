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
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true
          },
          {
            type: "string",
            name: "category",
            label: "Category",
            options: ["Sovereignty", "Dispatch", "Intelligence", "Community Signal"]
          },
          {
            type: "string",
            name: "author",
            label: "Author"
          },
          {
            type: "datetime",
            name: "date",
            label: "Date"
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true
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
          { type: "string", name: "title", label: "Title", isTitle: true, required: true },
          { type: "string", name: "type", label: "Type" },
          { type: "string", name: "detail", label: "Detail", ui: { component: "textarea" } },
          { type: "string", name: "status", label: "Status" }
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
          { type: "string", name: "title", label: "Title", isTitle: true, required: true },
          { type: "string", name: "duration", label: "Duration" },
          { type: "boolean", name: "free", label: "Free" }
        ]
      }
    ]
  }
});
export {
  config_default as default
};
