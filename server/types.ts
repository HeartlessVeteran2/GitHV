declare global {
  namespace Express {
    interface User {
      id: string;
      email?: string;
      firstName?: string;
      lastName?: string;
      profileImageUrl?: string;
      githubAccessToken?: string;
      createdAt?: Date;
      updatedAt?: Date;
    }
  }
}

export {};