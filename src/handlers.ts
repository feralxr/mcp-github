import { getClient, clean } from "./github.js";

// Trending uses the GitHub search API with date-range trick (no official trending endpoint)
function sinceDate(since: string): string {
  const d = new Date();
  if (since === "weekly") d.setDate(d.getDate() - 7);
  else if (since === "monthly") d.setDate(d.getDate() - 30);
  else d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

function repoSummary(r: any) {
  return {
    id: r.id,
    full_name: r.full_name,
    description: r.description,
    html_url: r.html_url,
    stars: r.stargazers_count,
    forks: r.forks_count,
    open_issues: r.open_issues_count,
    language: r.language,
    topics: r.topics,
    license: r.license?.name,
    created_at: r.created_at,
    updated_at: r.updated_at,
    pushed_at: r.pushed_at,
    default_branch: r.default_branch,
    archived: r.archived,
    fork: r.fork,
  };
}

export async function handleTool(name: string, args: Record<string, any>): Promise<any> {
  const gh = getClient();

  switch (name) {
    // ── SEARCH ──────────────────────────────────────────────────────────────
    case "search_repositories": {
      const { query, sort = "stars", order = "desc", limit = 10 } = args;
      const res = await gh.search.repos({ q: query, sort, order, per_page: Math.min(limit, 30) });
      return res.data.items.map(repoSummary);
    }

    case "search_code": {
      const { query, limit = 10 } = args;
      const res = await gh.search.code({ q: query, per_page: Math.min(limit, 30) });
      return res.data.items.map((item: any) => ({
        name: item.name,
        path: item.path,
        html_url: item.html_url,
        repository: item.repository.full_name,
        score: item.score,
      }));
    }

    case "search_issues": {
      const { query, sort = "created", order = "desc", limit = 10 } = args;
      const res = await gh.search.issuesAndPullRequests({ q: query, sort, order, per_page: Math.min(limit, 30) });
      return res.data.items.map((item: any) => ({
        number: item.number,
        title: item.title,
        html_url: item.html_url,
        state: item.state,
        type: item.pull_request ? "pull_request" : "issue",
        author: item.user?.login,
        labels: item.labels.map((l: any) => l.name),
        comments: item.comments,
        created_at: item.created_at,
        updated_at: item.updated_at,
        body: item.body?.slice(0, 500),
        repository: item.repository_url.split("/").slice(-2).join("/"),
      }));
    }

    case "search_users": {
      const { query, sort = "followers", limit = 10 } = args;
      const res = await gh.search.users({ q: query, sort, per_page: Math.min(limit, 30) });
      return res.data.items.map((u: any) => ({
        login: u.login,
        html_url: u.html_url,
        avatar_url: u.avatar_url,
        type: u.type,
        score: u.score,
      }));
    }

    // ── REPOSITORIES ─────────────────────────────────────────────────────────
    case "get_repository": {
      const { owner, repo } = args;
      const res = await gh.repos.get({ owner, repo });
      return {
        ...repoSummary(res.data),
        watchers: res.data.watchers_count,
        size_kb: res.data.size,
        homepage: res.data.homepage,
        visibility: res.data.visibility,
        has_wiki: res.data.has_wiki,
        has_discussions: (res.data as any).has_discussions,
        network_count: res.data.network_count,
        subscribers_count: res.data.subscribers_count,
        owner: {
          login: res.data.owner.login,
          type: res.data.owner.type,
          html_url: res.data.owner.html_url,
        },
      };
    }

    case "get_repository_readme": {
      const { owner, repo } = args;
      const res = await gh.repos.getReadme({ owner, repo });
      const content = Buffer.from(res.data.content, "base64").toString("utf-8");
      return {
        name: res.data.name,
        path: res.data.path,
        html_url: res.data.html_url,
        content: content.slice(0, 8000), // cap at 8k chars
        truncated: content.length > 8000,
      };
    }

    case "list_repository_files": {
      const { owner, repo, path = "", ref } = args;
      const res = await gh.repos.getContent({ owner, repo, path, ...(ref ? { ref } : {}) });
      const items = Array.isArray(res.data) ? res.data : [res.data];
      return items.map((item: any) => ({
        name: item.name,
        path: item.path,
        type: item.type,
        size: item.size,
        html_url: item.html_url,
        download_url: item.download_url,
      }));
    }

    case "get_file_contents": {
      const { owner, repo, path, ref } = args;
      const res = await gh.repos.getContent({ owner, repo, path, ...(ref ? { ref } : {}) });
      const data = res.data as any;
      if (data.type !== "file") throw new Error(`${path} is not a file`);
      const content = Buffer.from(data.content, "base64").toString("utf-8");
      return {
        name: data.name,
        path: data.path,
        size: data.size,
        html_url: data.html_url,
        content: content.slice(0, 10000),
        truncated: content.length > 10000,
      };
    }

    case "get_repository_topics": {
      const { owner, repo } = args;
      const res = await gh.repos.getAllTopics({ owner, repo });
      return { topics: res.data.names };
    }

    case "list_repository_languages": {
      const { owner, repo } = args;
      const res = await gh.repos.listLanguages({ owner, repo });
      const total = Object.values(res.data).reduce((a: any, b: any) => a + b, 0) as number;
      return Object.entries(res.data).map(([lang, bytes]) => ({
        language: lang,
        bytes,
        percentage: (((bytes as number) / total) * 100).toFixed(1) + "%",
      }));
    }

    // ── TRENDING & DISCOVERY ─────────────────────────────────────────────────
    case "get_trending_repositories": {
      const { language = "", since = "daily", limit = 10 } = args;
      const date = sinceDate(since);
      const q = `created:>${date}${language ? ` language:${language}` : ""}`;
      const res = await gh.search.repos({ q, sort: "stars", order: "desc", per_page: Math.min(limit, 30) });
      return res.data.items.map(repoSummary);
    }

    case "get_repository_stargazers": {
      const { owner, repo, limit = 20 } = args;
      const res = await gh.activity.listStargazersForRepo({ owner, repo, per_page: Math.min(limit, 30) });
      return (res.data as any[]).map((u: any) => ({
        login: u.login,
        html_url: u.html_url,
        avatar_url: u.avatar_url,
        type: u.type,
      }));
    }

    case "list_repository_forks": {
      const { owner, repo, sort = "newest", limit = 10 } = args;
      const res = await gh.repos.listForks({ owner, repo, sort, per_page: Math.min(limit, 30) });
      return res.data.map(repoSummary);
    }

    // ── ISSUES & PRS ─────────────────────────────────────────────────────────
    case "list_issues": {
      const { owner, repo, state = "open", labels, assignee, sort = "created", limit = 15 } = args;
      const res = await gh.issues.listForRepo({
        owner, repo, state, sort,
        ...(labels ? { labels } : {}),
        ...(assignee ? { assignee } : {}),
        per_page: Math.min(limit, 30),
      });
      return res.data
        .filter((i: any) => !i.pull_request) // issues only
        .map((i: any) => ({
          number: i.number,
          title: i.title,
          html_url: i.html_url,
          state: i.state,
          author: i.user?.login,
          assignees: i.assignees?.map((a: any) => a.login),
          labels: i.labels.map((l: any) => l.name),
          comments: i.comments,
          created_at: i.created_at,
          updated_at: i.updated_at,
          body: i.body?.slice(0, 500),
        }));
    }

    case "get_issue": {
      const { owner, repo, issue_number } = args;
      const res = await gh.issues.get({ owner, repo, issue_number });
      const i = res.data;
      return {
        number: i.number,
        title: i.title,
        html_url: i.html_url,
        state: i.state,
        author: i.user?.login,
        assignees: i.assignees?.map((a: any) => a.login),
        labels: i.labels.map((l: any) => (typeof l === "string" ? l : l.name)),
        milestone: (i.milestone as any)?.title,
        comments: i.comments,
        created_at: i.created_at,
        updated_at: i.updated_at,
        closed_at: i.closed_at,
        body: i.body,
        reactions: clean((i as any).reactions),
      };
    }

    case "list_pull_requests": {
      const { owner, repo, state = "open", sort = "created", base, limit = 15 } = args;
      const res = await gh.pulls.list({
        owner, repo, state, sort,
        ...(base ? { base } : {}),
        per_page: Math.min(limit, 30),
      });
      return res.data.map((pr: any) => ({
        number: pr.number,
        title: pr.title,
        html_url: pr.html_url,
        state: pr.state,
        author: pr.user?.login,
        draft: pr.draft,
        merged: pr.merged,
        base: pr.base.ref,
        head: pr.head.ref,
        labels: pr.labels.map((l: any) => l.name),
        reviewers: pr.requested_reviewers?.map((r: any) => r.login),
        created_at: pr.created_at,
        updated_at: pr.updated_at,
        body: pr.body?.slice(0, 500),
      }));
    }

    case "get_pull_request": {
      const { owner, repo, pull_number } = args;
      const res = await gh.pulls.get({ owner, repo, pull_number });
      const pr = res.data;
      return {
        number: pr.number,
        title: pr.title,
        html_url: pr.html_url,
        state: pr.state,
        author: pr.user?.login,
        draft: pr.draft,
        merged: pr.merged,
        mergeable: pr.mergeable,
        base: pr.base.ref,
        head: pr.head.ref,
        commits: pr.commits,
        additions: pr.additions,
        deletions: pr.deletions,
        changed_files: pr.changed_files,
        labels: pr.labels.map((l: any) => l.name),
        reviewers: pr.requested_reviewers?.map((r: any) => r.login),
        created_at: pr.created_at,
        updated_at: pr.updated_at,
        merged_at: pr.merged_at,
        body: pr.body,
      };
    }

    case "list_issue_comments": {
      const { owner, repo, issue_number, limit = 20 } = args;
      const res = await gh.issues.listComments({ owner, repo, issue_number, per_page: Math.min(limit, 30) });
      return res.data.map((c: any) => ({
        id: c.id,
        author: c.user?.login,
        body: c.body?.slice(0, 1000),
        created_at: c.created_at,
        updated_at: c.updated_at,
        html_url: c.html_url,
        reactions: clean((c as any).reactions),
      }));
    }

    // ── USERS ─────────────────────────────────────────────────────────────────
    case "get_user": {
      const res = await gh.users.getByUsername({ username: args.username });
      const u = res.data;
      return {
        login: u.login,
        name: u.name,
        bio: u.bio,
        company: u.company,
        location: u.location,
        blog: u.blog,
        email: u.email,
        twitter_username: (u as any).twitter_username,
        html_url: u.html_url,
        avatar_url: u.avatar_url,
        type: u.type,
        public_repos: u.public_repos,
        public_gists: u.public_gists,
        followers: u.followers,
        following: u.following,
        created_at: u.created_at,
        updated_at: u.updated_at,
      };
    }

    case "list_user_repositories": {
      const { username, sort = "updated", type = "owner", limit = 15 } = args;
      const res = await gh.repos.listForUser({ username, sort, type, per_page: Math.min(limit, 30) });
      return res.data.map(repoSummary);
    }

    case "list_user_starred": {
      const { username, sort = "created", limit = 15 } = args;
      const res = await gh.activity.listReposStarredByUser({ username, sort, per_page: Math.min(limit, 30) });
      return (res.data as any[]).map((item: any) => {
        const r = (item as any).repo ?? item;
        return repoSummary(r);
      });
    }

    case "get_user_gists": {
      const { username, limit = 10 } = args;
      const res = await gh.gists.listForUser({ username, per_page: Math.min(limit, 30) });
      return res.data.map((g: any) => ({
        id: g.id,
        description: g.description,
        html_url: g.html_url,
        public: g.public,
        files: Object.keys(g.files),
        comments: g.comments,
        created_at: g.created_at,
        updated_at: g.updated_at,
      }));
    }

    // ── ORGS & MISC ───────────────────────────────────────────────────────────
    case "get_organization": {
      const res = await gh.orgs.get({ org: args.org });
      const o = res.data;
      return {
        login: o.login,
        name: o.name,
        description: o.description,
        html_url: o.html_url,
        avatar_url: o.avatar_url,
        location: o.location,
        blog: o.blog,
        email: o.email,
        twitter_username: (o as any).twitter_username,
        public_repos: o.public_repos,
        public_gists: o.public_gists,
        followers: o.followers,
        following: o.following,
        created_at: o.created_at,
        members_can_create_repos: (o as any).members_can_create_repos,
      };
    }

    case "list_org_repositories": {
      const { org, sort = "updated", type = "public", limit = 15 } = args;
      const res = await gh.repos.listForOrg({ org, sort, type, per_page: Math.min(limit, 30) });
      return res.data.map(repoSummary);
    }

    case "get_repository_releases": {
      const { owner, repo, limit = 10 } = args;
      const res = await gh.repos.listReleases({ owner, repo, per_page: Math.min(limit, 30) });
      return res.data.map((r: any) => ({
        id: r.id,
        tag_name: r.tag_name,
        name: r.name,
        html_url: r.html_url,
        draft: r.draft,
        prerelease: r.prerelease,
        author: r.author?.login,
        assets: r.assets.map((a: any) => ({ name: a.name, download_count: a.download_count, size: a.size })),
        body: r.body?.slice(0, 1000),
        created_at: r.created_at,
        published_at: r.published_at,
      }));
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
