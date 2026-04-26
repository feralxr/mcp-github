export const tools = [
  // ── SEARCH ──────────────────────────────────────────────────────────────────
  {
    name: "search_repositories",
    description: "Search GitHub repositories by keyword, language, stars, topics, etc.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query. Supports qualifiers like language:typescript, stars:>1000, topic:react" },
        sort: { type: "string", enum: ["stars", "forks", "help-wanted-issues", "updated"], default: "stars" },
        order: { type: "string", enum: ["asc", "desc"], default: "desc" },
        limit: { type: "number", default: 10, description: "Number of results (max 30)" },
      },
      required: ["query"],
    },
  },
  {
    name: "search_code",
    description: "Search for code across all public GitHub repositories.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Code search query. Supports qualifiers like language:python, repo:owner/name, path:src/" },
        limit: { type: "number", default: 10 },
      },
      required: ["query"],
    },
  },
  {
    name: "search_issues",
    description: "Search issues and pull requests across GitHub.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query. Use is:issue, is:pr, is:open, is:closed, label:bug, repo:owner/name etc." },
        sort: { type: "string", enum: ["comments", "reactions", "created", "updated"], default: "created" },
        order: { type: "string", enum: ["asc", "desc"], default: "desc" },
        limit: { type: "number", default: 10 },
      },
      required: ["query"],
    },
  },
  {
    name: "search_users",
    description: "Search GitHub users and organisations by name, location, language, followers, etc.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query. Supports qualifiers like location:India, language:rust, followers:>1000" },
        sort: { type: "string", enum: ["followers", "repositories", "joined"], default: "followers" },
        limit: { type: "number", default: 10 },
      },
      required: ["query"],
    },
  },

  // ── REPOSITORIES ─────────────────────────────────────────────────────────────
  {
    name: "get_repository",
    description: "Get full details of a GitHub repository: stars, forks, description, license, open issues, etc.",
    inputSchema: {
      type: "object",
      properties: {
        owner: { type: "string", description: "Repository owner (user or org)" },
        repo: { type: "string", description: "Repository name" },
      },
      required: ["owner", "repo"],
    },
  },
  {
    name: "get_repository_readme",
    description: "Get the README content of a GitHub repository.",
    inputSchema: {
      type: "object",
      properties: {
        owner: { type: "string" },
        repo: { type: "string" },
      },
      required: ["owner", "repo"],
    },
  },
  {
    name: "list_repository_files",
    description: "List files and directories in a repository at a given path.",
    inputSchema: {
      type: "object",
      properties: {
        owner: { type: "string" },
        repo: { type: "string" },
        path: { type: "string", default: "", description: "Directory path inside the repo (empty = root)" },
        ref: { type: "string", description: "Branch, tag or commit SHA (default: default branch)" },
      },
      required: ["owner", "repo"],
    },
  },
  {
    name: "get_file_contents",
    description: "Get the raw contents of a specific file in a repository.",
    inputSchema: {
      type: "object",
      properties: {
        owner: { type: "string" },
        repo: { type: "string" },
        path: { type: "string", description: "File path inside the repo, e.g. src/index.ts" },
        ref: { type: "string", description: "Branch, tag or commit SHA (default: default branch)" },
      },
      required: ["owner", "repo", "path"],
    },
  },
  {
    name: "get_repository_topics",
    description: "Get all topics/tags associated with a repository.",
    inputSchema: {
      type: "object",
      properties: {
        owner: { type: "string" },
        repo: { type: "string" },
      },
      required: ["owner", "repo"],
    },
  },
  {
    name: "list_repository_languages",
    description: "Get the programming languages used in a repository with byte counts.",
    inputSchema: {
      type: "object",
      properties: {
        owner: { type: "string" },
        repo: { type: "string" },
      },
      required: ["owner", "repo"],
    },
  },

  // ── TRENDING & DISCOVERY ──────────────────────────────────────────────────────
  {
    name: "get_trending_repositories",
    description: "Get trending GitHub repositories for a given language and time period.",
    inputSchema: {
      type: "object",
      properties: {
        language: { type: "string", description: "Programming language filter (e.g. python, typescript). Leave empty for all languages." },
        since: { type: "string", enum: ["daily", "weekly", "monthly"], default: "daily" },
        limit: { type: "number", default: 10 },
      },
    },
  },
  {
    name: "get_repository_stargazers",
    description: "Get a list of users who have starred a repository.",
    inputSchema: {
      type: "object",
      properties: {
        owner: { type: "string" },
        repo: { type: "string" },
        limit: { type: "number", default: 20 },
      },
      required: ["owner", "repo"],
    },
  },
  {
    name: "list_repository_forks",
    description: "List forks of a repository, sorted by newest, oldest, or most starred.",
    inputSchema: {
      type: "object",
      properties: {
        owner: { type: "string" },
        repo: { type: "string" },
        sort: { type: "string", enum: ["newest", "oldest", "stargazers", "watchers"], default: "newest" },
        limit: { type: "number", default: 10 },
      },
      required: ["owner", "repo"],
    },
  },

  // ── ISSUES & PRS ──────────────────────────────────────────────────────────────
  {
    name: "list_issues",
    description: "List issues in a repository with filtering by state, labels, assignee, etc.",
    inputSchema: {
      type: "object",
      properties: {
        owner: { type: "string" },
        repo: { type: "string" },
        state: { type: "string", enum: ["open", "closed", "all"], default: "open" },
        labels: { type: "string", description: "Comma-separated label names, e.g. bug,help wanted" },
        assignee: { type: "string", description: "Filter by assignee username" },
        sort: { type: "string", enum: ["created", "updated", "comments"], default: "created" },
        limit: { type: "number", default: 15 },
      },
      required: ["owner", "repo"],
    },
  },
  {
    name: "get_issue",
    description: "Get full details of a specific issue including body, labels, assignees, and comments count.",
    inputSchema: {
      type: "object",
      properties: {
        owner: { type: "string" },
        repo: { type: "string" },
        issue_number: { type: "number" },
      },
      required: ["owner", "repo", "issue_number"],
    },
  },
  {
    name: "list_pull_requests",
    description: "List pull requests in a repository.",
    inputSchema: {
      type: "object",
      properties: {
        owner: { type: "string" },
        repo: { type: "string" },
        state: { type: "string", enum: ["open", "closed", "all"], default: "open" },
        sort: { type: "string", enum: ["created", "updated", "popularity", "long-running"], default: "created" },
        base: { type: "string", description: "Filter PRs by base branch name" },
        limit: { type: "number", default: 15 },
      },
      required: ["owner", "repo"],
    },
  },
  {
    name: "get_pull_request",
    description: "Get full details of a specific pull request including diff stats, reviewers, and merge status.",
    inputSchema: {
      type: "object",
      properties: {
        owner: { type: "string" },
        repo: { type: "string" },
        pull_number: { type: "number" },
      },
      required: ["owner", "repo", "pull_number"],
    },
  },
  {
    name: "list_issue_comments",
    description: "Get all comments on a specific issue or pull request.",
    inputSchema: {
      type: "object",
      properties: {
        owner: { type: "string" },
        repo: { type: "string" },
        issue_number: { type: "number" },
        limit: { type: "number", default: 20 },
      },
      required: ["owner", "repo", "issue_number"],
    },
  },

  // ── USERS ─────────────────────────────────────────────────────────────────────
  {
    name: "get_user",
    description: "Get a GitHub user's public profile: bio, followers, following, public repos, company, location, etc.",
    inputSchema: {
      type: "object",
      properties: {
        username: { type: "string" },
      },
      required: ["username"],
    },
  },
  {
    name: "list_user_repositories",
    description: "List public repositories for a GitHub user.",
    inputSchema: {
      type: "object",
      properties: {
        username: { type: "string" },
        sort: { type: "string", enum: ["created", "updated", "pushed", "full_name"], default: "updated" },
        type: { type: "string", enum: ["all", "owner", "member"], default: "owner" },
        limit: { type: "number", default: 15 },
      },
      required: ["username"],
    },
  },
  {
    name: "list_user_starred",
    description: "Get repositories that a GitHub user has starred.",
    inputSchema: {
      type: "object",
      properties: {
        username: { type: "string" },
        sort: { type: "string", enum: ["created", "updated"], default: "created" },
        limit: { type: "number", default: 15 },
      },
      required: ["username"],
    },
  },
  {
    name: "get_user_gists",
    description: "List public gists for a GitHub user.",
    inputSchema: {
      type: "object",
      properties: {
        username: { type: "string" },
        limit: { type: "number", default: 10 },
      },
      required: ["username"],
    },
  },

  // ── ORGS & MISC ───────────────────────────────────────────────────────────────
  {
    name: "get_organization",
    description: "Get details about a GitHub organisation: description, members count, public repos, location, etc.",
    inputSchema: {
      type: "object",
      properties: {
        org: { type: "string", description: "Organisation login name" },
      },
      required: ["org"],
    },
  },
  {
    name: "list_org_repositories",
    description: "List public repositories for a GitHub organisation.",
    inputSchema: {
      type: "object",
      properties: {
        org: { type: "string" },
        sort: { type: "string", enum: ["created", "updated", "pushed", "full_name"], default: "updated" },
        type: { type: "string", enum: ["all", "public", "forks", "sources", "member"], default: "public" },
        limit: { type: "number", default: 15 },
      },
      required: ["org"],
    },
  },
  {
    name: "get_repository_releases",
    description: "Get all releases for a repository, including release notes, assets, and publish dates.",
    inputSchema: {
      type: "object",
      properties: {
        owner: { type: "string" },
        repo: { type: "string" },
        limit: { type: "number", default: 10 },
      },
      required: ["owner", "repo"],
    },
  },
];
