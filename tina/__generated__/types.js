export function gql(strings, ...args) {
  let str = "";
  strings.forEach((string, i) => {
    str += string + (args[i] || "");
  });
  return str;
}
export const PostPartsFragmentDoc = gql`
    fragment PostParts on Post {
  __typename
  title
  slug
  category
  author
  date
  excerpt
  access
  status
  body
  kgQuery
  seo {
    __typename
    title
    description
    keywords
    ogImage
  }
  knowledgeGraph {
    __typename
    nodes {
      __typename
      id
      label
      type
      description
      definition
      datetime
      location
      src
      alt
      order
      prompt
    }
    edges {
      __typename
      from
      to
      label
      weight
    }
    presets {
      __typename
      id
      label
      description
      filters
      highlightIds
      focusNodeId
    }
    narratives {
      __typename
      id
      title
      description
      steps
    }
  }
  protocolEval {
    __typename
    protocol
    chain
    tvl
    riskScore
    audit
    recommendation
    category
    auditedBy
    launchDate
  }
}
    `;
export const ServicePartsFragmentDoc = gql`
    fragment ServiceParts on Service {
  __typename
  title
  description
  price
  duration
}
    `;
export const ProjectPartsFragmentDoc = gql`
    fragment ProjectParts on Project {
  __typename
  slug
  title
  tagline
  description
  category
  status
  chain
  agents
  tokenSymbol
  tokenName
  tokenAddress
  tokenPrice
  tvl
  goal
  raised
  investors
  progress
  scomRequired
  updates {
    __typename
    from
    date
    text
    type
  }
}
    `;
export const AgentPartsFragmentDoc = gql`
    fragment AgentParts on Agent {
  __typename
  title
  role
  status
  description
}
    `;
export const SchoolModulePartsFragmentDoc = gql`
    fragment SchoolModuleParts on SchoolModule {
  __typename
  moduleId
  title
  subtitle
  description
  difficulty
  access
  duration
  credential
  icon
  color
  done
  lessons {
    __typename
    id
    title
    description
    duration
    topics
  }
}
    `;
export const PostDocument = gql`
    query post($relativePath: String!) {
  post(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...PostParts
  }
}
    ${PostPartsFragmentDoc}`;
export const PostConnectionDocument = gql`
    query postConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: PostFilter) {
  postConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...PostParts
      }
    }
  }
}
    ${PostPartsFragmentDoc}`;
export const ServiceDocument = gql`
    query service($relativePath: String!) {
  service(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...ServiceParts
  }
}
    ${ServicePartsFragmentDoc}`;
export const ServiceConnectionDocument = gql`
    query serviceConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: ServiceFilter) {
  serviceConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...ServiceParts
      }
    }
  }
}
    ${ServicePartsFragmentDoc}`;
export const ProjectDocument = gql`
    query project($relativePath: String!) {
  project(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...ProjectParts
  }
}
    ${ProjectPartsFragmentDoc}`;
export const ProjectConnectionDocument = gql`
    query projectConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: ProjectFilter) {
  projectConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...ProjectParts
      }
    }
  }
}
    ${ProjectPartsFragmentDoc}`;
export const AgentDocument = gql`
    query agent($relativePath: String!) {
  agent(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...AgentParts
  }
}
    ${AgentPartsFragmentDoc}`;
export const AgentConnectionDocument = gql`
    query agentConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: AgentFilter) {
  agentConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...AgentParts
      }
    }
  }
}
    ${AgentPartsFragmentDoc}`;
export const SchoolModuleDocument = gql`
    query schoolModule($relativePath: String!) {
  schoolModule(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...SchoolModuleParts
  }
}
    ${SchoolModulePartsFragmentDoc}`;
export const SchoolModuleConnectionDocument = gql`
    query schoolModuleConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: SchoolModuleFilter) {
  schoolModuleConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...SchoolModuleParts
      }
    }
  }
}
    ${SchoolModulePartsFragmentDoc}`;
export function getSdk(requester) {
  return {
    post(variables, options) {
      return requester(PostDocument, variables, options);
    },
    postConnection(variables, options) {
      return requester(PostConnectionDocument, variables, options);
    },
    service(variables, options) {
      return requester(ServiceDocument, variables, options);
    },
    serviceConnection(variables, options) {
      return requester(ServiceConnectionDocument, variables, options);
    },
    project(variables, options) {
      return requester(ProjectDocument, variables, options);
    },
    projectConnection(variables, options) {
      return requester(ProjectConnectionDocument, variables, options);
    },
    agent(variables, options) {
      return requester(AgentDocument, variables, options);
    },
    agentConnection(variables, options) {
      return requester(AgentConnectionDocument, variables, options);
    },
    schoolModule(variables, options) {
      return requester(SchoolModuleDocument, variables, options);
    },
    schoolModuleConnection(variables, options) {
      return requester(SchoolModuleConnectionDocument, variables, options);
    }
  };
}
import { createClient } from "tinacms/dist/client";
const generateRequester = (client) => {
  const requester = async (doc, vars, options) => {
    let url = client.apiUrl;
    if (options?.branch) {
      const index = client.apiUrl.lastIndexOf("/");
      url = client.apiUrl.substring(0, index + 1) + options.branch;
    }
    const data = await client.request({
      query: doc,
      variables: vars,
      url
    }, options);
    return { data: data?.data, errors: data?.errors, query: doc, variables: vars || {} };
  };
  return requester;
};
export const ExperimentalGetTinaClient = () => getSdk(
  generateRequester(
    createClient({
      url: "http://localhost:4001/graphql",
      queries
    })
  )
);
export const queries = (client) => {
  const requester = generateRequester(client);
  return getSdk(requester);
};
