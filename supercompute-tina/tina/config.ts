import { defineConfig } from 'tinacms'

export default defineConfig({
  branch: process.env.NEXT_PUBLIC_TINA_BRANCH || 'main',
  clientId: process.env.TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,
  build: {
    outputFolder: 'public',
    publicFolder: 'public',
  },
  media: {
    tina: {
      mediaRoot: 'images',
      publicFolder: 'public/images',
    },
  },
  schema: {
    collections: [
      {
        name: 'post',
        label: 'NewsDesk Articles',
        path: 'content/posts',
        fields: [
          { name: 'title', type: 'string', label: 'Title' },
          { name: 'date', type: 'datetime', label: 'Date' },
          { name: 'category', type: 'string', label: 'Category' },
          { name: 'author', type: 'string', label: 'Author' },
          { name: 'excerpt', type: 'string', label: 'Excerpt' },
          { name: 'body', type: 'rich-text', label: 'Body' },
        ],
      },
      {
        name: 'page',
        label: 'Pages',
        path: 'content/pages',
        fields: [
          { name: 'title', type: 'string', label: 'Title' },
          { name: 'body', type: 'rich-text', label: 'Body' },
        ],
      },
      {
        name: 'schoolModule',
        label: 'School Modules',
        path: 'content/school',
        fields: [
          { name: 'title', type: 'string', label: 'Title' },
          { name: 'order', type: 'number', label: 'Order' },
          { name: 'description', type: 'string', label: 'Description' },
          { name: 'body', type: 'rich-text', label: 'Content' },
        ],
      },
      {
        name: 'project',
        label: 'Projects',
        path: 'content/projects',
        fields: [
          { name: 'title', type: 'string', label: 'Title' },
          { name: 'ticker', type: 'string', label: 'Ticker' },
          { name: 'stack', type: 'string', label: 'Stack' },
          { name: 'status', type: 'string', label: 'Status' },
          { name: 'description', type: 'string', label: 'Description' },
        ],
      },
      {
        name: 'consulting',
        label: 'Consulting Engagements',
        path: 'content/consulting',
        fields: [
          { name: 'title', type: 'string', label: 'Title' },
          { name: 'engagementType', type: 'string', label: 'Type' },
          { name: 'description', type: 'string', label: 'Description' },
          { name: 'body', type: 'rich-text', label: 'Details' },
        ],
      },
    ],
  },
})