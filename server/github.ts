import { Octokit } from "@octokit/rest";

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  name: string;
  email: string;
  public_repos: number;
  followers: number;
  following: number;
}

export interface GitHubCommit {
  sha: string;
  message: string;
  author: {
    name: string;
    email: string;
    date: string;
  };
  url: string;
}

export interface GitHubBranch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
}

export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  body: string;
  state: string;
  created_at: string;
  updated_at: string;
  head: {
    ref: string;
    sha: string;
  };
  base: {
    ref: string;
    sha: string;
  };
  user: {
    login: string;
    avatar_url: string;
  };
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string;
  state: string;
  created_at: string;
  updated_at: string;
  labels: Array<{
    name: string;
    color: string;
  }>;
  user: {
    login: string;
    avatar_url: string;
  };
}

export interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string;
  body: string;
  published_at: string;
  prerelease: boolean;
  assets: Array<{
    name: string;
    download_count: number;
    size: number;
  }>;
}

export class GitHubService {
  private octokit: Octokit;

  constructor(accessToken: string) {
    this.octokit = new Octokit({
      auth: accessToken,
    });
  }

  async getUserRepositories() {
    const { data } = await this.octokit.repos.listForAuthenticatedUser({
      sort: "updated",
      per_page: 100,
    });
    return data;
  }

  async getRepository(owner: string, repo: string) {
    const { data } = await this.octokit.repos.get({
      owner,
      repo,
    });
    return data;
  }

  async getRepositoryContents(owner: string, repo: string, path: string = "") {
    const { data } = await this.octokit.repos.getContent({
      owner,
      repo,
      path,
    });
    return data;
  }

  async getFileContent(owner: string, repo: string, path: string) {
    const { data } = await this.octokit.repos.getContent({
      owner,
      repo,
      path,
    });
    
    if (Array.isArray(data) || data.type !== "file") {
      throw new Error("Path is not a file");
    }
    
    return {
      content: Buffer.from(data.content, "base64").toString("utf-8"),
      sha: data.sha,
      size: data.size,
    };
  }

  async updateFile(
    owner: string,
    repo: string,
    path: string,
    content: string,
    sha: string,
    message: string
  ) {
    const { data } = await this.octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content: Buffer.from(content).toString("base64"),
      sha,
    });
    return data;
  }

  async createFile(
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string
  ) {
    const { data } = await this.octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content: Buffer.from(content).toString("base64"),
    });
    return data;
  }

  async deleteFile(
    owner: string,
    repo: string,
    path: string,
    sha: string,
    message: string
  ) {
    const { data } = await this.octokit.repos.deleteFile({
      owner,
      repo,
      path,
      message,
      sha,
    });
    return data;
  }

  async getBranches(owner: string, repo: string) {
    const { data } = await this.octokit.repos.listBranches({
      owner,
      repo,
    });
    return data;
  }

  async getCommits(owner: string, repo: string, sha?: string) {
    const { data } = await this.octokit.repos.listCommits({
      owner,
      repo,
      sha,
    });
    return data;
  }

  async getUser(): Promise<GitHubUser> {
    const response = await this.octokit.rest.users.getAuthenticated();
    return {
      login: response.data.login,
      id: response.data.id,
      avatar_url: response.data.avatar_url,
      name: response.data.name || '',
      email: response.data.email || '',
      public_repos: response.data.public_repos,
      followers: response.data.followers,
      following: response.data.following
    };
  }

  async getPullRequests(owner: string, repo: string, state: 'open' | 'closed' | 'all' = 'open'): Promise<GitHubPullRequest[]> {
    const response = await this.octokit.rest.pulls.list({
      owner,
      repo,
      state,
      per_page: 50
    });

    return response.data.map(pr => ({
      id: pr.id,
      number: pr.number,
      title: pr.title,
      body: pr.body || '',
      state: pr.state,
      created_at: pr.created_at,
      updated_at: pr.updated_at,
      head: {
        ref: pr.head.ref,
        sha: pr.head.sha
      },
      base: {
        ref: pr.base.ref,
        sha: pr.base.sha
      },
      user: {
        login: pr.user?.login || '',
        avatar_url: pr.user?.avatar_url || ''
      }
    }));
  }

  async getIssues(owner: string, repo: string, state: 'open' | 'closed' | 'all' = 'open'): Promise<GitHubIssue[]> {
    const response = await this.octokit.rest.issues.listForRepo({
      owner,
      repo,
      state,
      per_page: 50
    });

    return response.data
      .filter(issue => !issue.pull_request)
      .map(issue => ({
        id: issue.id,
        number: issue.number,
        title: issue.title,
        body: issue.body || '',
        state: issue.state,
        created_at: issue.created_at,
        updated_at: issue.updated_at,
        labels: issue.labels?.map(label => ({
          name: typeof label === 'string' ? label : label.name || '',
          color: typeof label === 'string' ? '' : label.color || ''
        })) || [],
        user: {
          login: issue.user?.login || '',
          avatar_url: issue.user?.avatar_url || ''
        }
      }));
  }

  async getReleases(owner: string, repo: string): Promise<GitHubRelease[]> {
    const response = await this.octokit.rest.repos.listReleases({
      owner,
      repo,
      per_page: 20
    });

    return response.data.map(release => ({
      id: release.id,
      tag_name: release.tag_name,
      name: release.name || release.tag_name,
      body: release.body || '',
      published_at: release.published_at || '',
      prerelease: release.prerelease,
      assets: release.assets.map(asset => ({
        name: asset.name,
        download_count: asset.download_count,
        size: asset.size
      }))
    }));
  }

  async createBranch(owner: string, repo: string, branchName: string, fromBranch: string = 'main'): Promise<any> {
    const baseRef = await this.octokit.rest.git.getRef({
      owner,
      repo,
      ref: `heads/${fromBranch}`
    });

    const response = await this.octokit.rest.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branchName}`,
      sha: baseRef.data.object.sha
    });

    return response.data;
  }

  async createPullRequest(owner: string, repo: string, title: string, body: string, head: string, base: string): Promise<any> {
    const response = await this.octokit.rest.pulls.create({
      owner,
      repo,
      title,
      body,
      head,
      base
    });

    return response.data;
  }

  async createIssue(owner: string, repo: string, title: string, body: string, labels?: string[]): Promise<any> {
    const response = await this.octokit.rest.issues.create({
      owner,
      repo,
      title,
      body,
      labels
    });

    return response.data;
  }

  async getRepositoryStats(owner: string, repo: string): Promise<any> {
    const [repoInfo, languages, contributors] = await Promise.all([
      this.octokit.rest.repos.get({ owner, repo }),
      this.octokit.rest.repos.listLanguages({ owner, repo }),
      this.octokit.rest.repos.listContributors({ owner, repo, per_page: 10 })
    ]);

    return {
      repository: {
        stars: repoInfo.data.stargazers_count,
        forks: repoInfo.data.forks_count,
        watchers: repoInfo.data.watchers_count,
        issues: repoInfo.data.open_issues_count,
        size: repoInfo.data.size,
        created_at: repoInfo.data.created_at,
        updated_at: repoInfo.data.updated_at,
        default_branch: repoInfo.data.default_branch,
        license: repoInfo.data.license?.name
      },
      languages: languages.data,
      contributors: contributors.data.map(contributor => ({
        login: contributor.login,
        avatar_url: contributor.avatar_url,
        contributions: contributor.contributions
      }))
    };
  }

  async searchRepositories(query: string, sort?: 'stars' | 'forks' | 'updated'): Promise<any> {
    const response = await this.octokit.rest.search.repos({
      q: query,
      sort,
      order: 'desc',
      per_page: 20
    });

    return response.data.items.map(repo => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      private: repo.private,
      html_url: repo.html_url,
      clone_url: repo.clone_url,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      language: repo.language,
      updated_at: repo.updated_at
    }));
  }
}
