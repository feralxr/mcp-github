<div align="center">

# mcp-github

**A Model Context Protocol server that gives AI models full read access to GitHub.**

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

It works with **Claude.ai**, **Claude Desktop**, **Cursor**, **Windsurf**, and any other MCP-compatible client.

---

## Tools

25 tools across 5 categories:

<details>
<summary><b>Search — 4 tools</b></summary>

| Tool | Description |
|------|-------------|
| `search_repositories` | Search repos by keyword, language, stars, topics. Supports qualifiers like `language:typescript stars:>1000` |
| `search_code` | Search code across all public repositories |
| `search_issues` | Search issues and PRs. Use `is:issue`, `is:pr`, `label:bug`, `repo:owner/name` etc. |
| `search_users` | Find users by name, location, followers, language |

</details>

<details>
<summary><b>Repositories — 6 tools</b></summary>

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
<summary><b>Trending & Discovery — 3 tools</b></summary>

| Tool | Description |
|------|-------------|
| `get_trending_repositories` | Trending repos by language and time period (daily/weekly/monthly) |
| `get_repository_stargazers` | List users who starred a repo |
| `list_repository_forks` | Forks sorted by newest, oldest, or most starred |

</details>

<details>
<summary><b>Issues & Pull Requests — 5 tools</b></summary>

| Tool | Description |
|------|-------------|
| `list_issues` | List issues with filters: state, labels, assignee, sort |
| `get_issue` | Full issue details with body, labels, assignees, reactions |
| `list_pull_requests` | List PRs with state and base branch filters |
| `get_pull_request` | Full PR details: diff stats, reviewers, merge status |
| `list_issue_comments` | All comments on an issue or PR |

</details>

<details>
<summary><b>Users, Orgs & Releases — 7 tools</b></summary>

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

---

## Using with Claude.ai (web)

Claude.ai connects to MCP servers over the internet, so you need to deploy this server publicly before connecting it. Here's the full flow:

### Step 1 — Deploy to Railway (free)

Railway is the easiest option — free tier, no credit card required, deploys in under 2 minutes.

1. Push this repo to GitHub
2. Go to [railway.app](https://railway.app) and create a new project
3. Select **Deploy from GitHub repo** and pick your fork
4. Go to **Variables** and add:
   ```
   GITHUB_TOKEN = ghp_your_token_here
   ```
5. Railway will build and deploy automatically. Copy the public URL it gives you (e.g. `https://mcp-github-production.up.railway.app`)

> You can also deploy to [Render](https://render.com) or [Fly.io](https://fly.io) — both have free tiers and work the same way.

### Step 2 — Connect on Claude.ai

> Requires a **Pro, Max, Team, or Enterprise** plan.

1. Open [claude.ai](https://claude.ai) and go to **Settings**
2. Click **Connectors** in the sidebar
3. Scroll down and click **Add custom connector**
4. Paste your Railway URL and click **Add**
5. Follow any authentication prompts

### Step 3 — Enable in a conversation

1. Start a new chat
2. Click the **+** button in the bottom left
3. Select **Connectors**
4. Toggle on `mcp-github`

Claude can now access all 25 GitHub tools in that conversation.

---

## Using with Claude Desktop

<details>
<summary>Expand</summary>

Edit your config file:

- **Mac:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

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

Restart Claude Desktop. The tools will appear in the tools menu.

</details>

## Using with Cursor / Windsurf

<details>
<summary>Expand</summary>

Point your client at `dist/index.js` with `GITHUB_TOKEN` set as an environment variable. Refer to your client's MCP documentation for the exact config format.

</details>

---

## Testing locally

**MCP Inspector — test any tool without an AI client**

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

Opens at `localhost:5173`. Pick a tool, fill in the inputs, hit Run, and see the raw JSON response.

**Smoke test**

```bash
GITHUB_TOKEN=ghp_xxx node dist/index.js
# Expected output: mcp-github server running on stdio
```

**Direct tool call**

```bash
GITHUB_TOKEN=ghp_xxx node -e "
import('./dist/handlers.js').then(m =>
  m.handleTool('get_trending_repositories', { since: 'daily', limit: 5 })
    .then(r => console.log(JSON.stringify(r, null, 2)))
)"
```

---

## Example prompts

```
What are the trending TypeScript repos today?
Show me all open bugs in vercel/next.js
Read the README of facebook/react
What languages does torvalds/linux use?
Find GitHub users in India with over 1000 followers
Search for code using the Anthropic SDK in Python
What repos has sindresorhus starred recently?
Show me the latest releases of microsoft/vscode
Get the top issues in next.js labelled 'good first issue'
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
