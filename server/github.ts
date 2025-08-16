import { Octokit } from "@octokit/rest";

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
}
