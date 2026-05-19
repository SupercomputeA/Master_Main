import { useTina } from "tinacms/dist/react"
import { client } from "../../../tina/__generated__/client"

export default function BlogPostPage(props) {
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  })

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "2rem", fontFamily: "JetBrains Mono, monospace", color: "#F4ECD8", background: "#0a1330", minHeight: "100vh" }}>
      <h1 style={{ color: "#C9A33A" }}>{data.post.title}</h1>
      <div style={{ lineHeight: 1.8, color: "#6FA3E5" }}>{data.post.body}</div>
    </div>
  )
}

export const getStaticProps = async ({ params }) => {
  const { data, query, variables } = await client.queries.post({
    relativePath: `${params.filename}.md`,
  })

  return {
    props: {
      data,
      query,
      variables,
    },
  }
}

export const getStaticPaths = async () => {
  const posts = await client.queries.postConnection()
  const paths = posts.data.postConnection.edges.map((edge) => ({
    params: { filename: edge.node._sys.filename },
  }))

  return {
    paths,
    fallback: "blocking",
  }
}
