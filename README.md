<div align="center">

# mcp-github 🐙

**A Model Context Protocol server that gives AI full read access to GitHub.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MCP](https://img.shields.io/badge/MCP-Compatible-8B5CF6?style=flat-square)](https://modelcontextprotocol.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-22C55E?style=flat-square)](LICENSE)
[![Tools](https://img.shields.io/badge/Tools-25-F59E0B?style=flat-square)](#tools)

Search repos, read code, track issues, explore users — all from within any MCP-compatible AI like Claude.

</div>

---

## What is this?

`mcp-github` is an [MCP server](https://modelcontextprotocol.io/) that connects AI models to the GitHub API. Instead of copy-pasting repo links or manually browsing GitHub, you can ask your AI directly:

> *"What are the trending TypeScript repos this week?"*  
> *"Show me all open bugs in vercel/next.js"*  
> *"What has @sindresorhus starred recently?"*

It works with **Claude**, **Cursor**, **Windsurf**, and any other MCP-compatible client.

---

## Tools

25 tools across 5 categories:

<details>
<summary><b>🔍 Search (4 tools)</b></summary>

| Tool | Description |
|------|-------------|
| `search_repositories` | Search repos by keyword, language, stars, topics. Supports qualifiers like `language:typescript stars:>1000` |
| `search_code` | Search code across all public repositories |
| `search_issues` | Search issues and PRs. Use `is:issue`, `is:pr`, `label:bug`, `repo:owner/name` etc. |
| `search_users` | Find users by name, location, followers, language |

</details>

<details>
<summary><b>📦 Repositories (6 tools)</b></summary>

| Tool | Description |
|------|-------------|
| `get_repository` | Full repo details: stars, forks, license, topics, open issues |
| `get_repository_readme` | Read a repo's README (up to 8,000 chars) |
| `list_repository_files` | Browse files and directories at any path |
| `get_file_contents` | Read any file in any repo (up to 10,000 chars) |
| `get_repository_topics` | Get all topics/tags on a repo |
| `list_repository_languages` | Languages used with byte counts and percentages |

</details>

<details>
<summary><b>⭐ Trending & Discovery (3 tools)</b></summary>

| Tool | Description |
|------|-------------|
| `get_trending_repositories` | Trending repos by language and time period (daily/weekly/monthly) |
| `get_repository_stargazers` | List users who starred a repo |
| `list_repository_forks` | Forks sorted by newest, oldest, or most starred |

</details>

<details>
<summary><b>🐛 Issues & Pull Requests (5 tools)</b></summary>

| Tool | Description |
|------|-------------|
| `list_issues` | List issues with filters: state, labels, assignee, sort |
| `get_issue` | Full issue details with body, labels, assignees, reactions |
| `list_pull_requests` | List PRs with state and base branch filters |
| `get_pull_request` | Full PR details: diff stats, reviewers, merge status |
| `list_issue_comments` | All comments on an issue or PR |

</details>

<details>
<summary><b>👤 Users, Orgs & Releases (7 tools)</b></summary>

| Tool | Description |
|------|-------------|
| `get_user` | Public profile: bio, followers, location, stats |
| `list_user_repositories` | A user's public repositories |
| `list_user_starred` | Repos starred by a user |
| `get_user_gists` | A user's public gists |
| `get_organization` | Org details: members, repos, description |
| `list_org_repositories` | All public repos for an organisation |
| `get_repository_releases` | Releases with notes, assets, and download counts |

</details>

---

## Setup

### 1. Clone and build

```bash
git clone https://github.com/yourusername/mcp-github
cd mcp-github
npm install
npm run build
```

### 2. Get a GitHub token

> **Without a token:** 60 requests/hour  
> **With a token:** 5,000 requests/hour

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click **Generate new token (classic)**
3. Select scopes: `public_repo`, `read:user`, `read:org`
4. Copy the token

### 3. Connect to your AI client

<details>
<summary><b>Claude Desktop</b></summary>

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (Mac) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "github": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-github/dist/index.js"],
      "env": {
        "GITHUB_TOKEN": "ghp_your_token_here"
      }
    }
  }
}
```

Restart Claude Desktop.

</details>

<details>
<summary><b>Cursor / Windsurf / Other MCP clients</b></summary>

Point your client at `dist/index.js` with the `GITHUB_TOKEN` environment variable set. Refer to your client's MCP documentation for the exact config format.

</details>

---

## Testing

**Option 1 — MCP Inspector (recommended)**

The easiest way to verify everything works without any AI client:

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

Opens a browser UI at `localhost:5173`. Select any tool, fill in the inputs, hit Run, and see the live JSON response.

**Option 2 — Quick smoke test**

```bash
GITHUB_TOKEN=ghp_xxx node dist/index.js
# Output: mcp-github server running on stdio
```

**Option 3 — Direct tool call**

```bash
GITHUB_TOKEN=ghp_xxx node -e "
import('./dist/handlers.js').then(m =>
  m.handleTool('get_trending_repositories', { since: 'daily', limit: 5 })
    .then(r => console.log(JSON.stringify(r, null, 2)))
)"
```

---

## Example prompts

Once connected:

```
What are the trending TypeScript repos today?
Show me all open bugs in vercel/next.js
Read the README of facebook/react
What languages does torvalds/linux use?
Find GitHub users in India with over 1000 followers
Search for code using the Anthropic SDK in Python
What repos has sindresorhus starred recently?
Show me the latest releases of microsoft/vscode
Get me the top issues from the next.js repo labelled 'good first issue'
```

---

## Tech stack

- **TypeScript** — fully typed codebase
- **[@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/typescript-sdk)** — official MCP SDK
- **[@octokit/rest](https://github.com/octokit/rest.js)** — official GitHub API client
- **[zod](https://github.com/colinhacks/zod)** — schema validation

---

## License

MIT
