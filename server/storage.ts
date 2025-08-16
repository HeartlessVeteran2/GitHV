import {
  users,
  repositories,
  files,
  type User,
  type UpsertUser,
  type Repository,
  type InsertRepository,
  type File,
  type InsertFile,
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Repository operations
  getUserRepositories(userId: string): Promise<Repository[]>;
  getRepository(id: string): Promise<Repository | undefined>;
  createRepository(repository: InsertRepository): Promise<Repository>;
  updateRepository(id: string, repository: Partial<InsertRepository>): Promise<Repository>;
  deleteRepository(id: string): Promise<void>;
  
  // File operations
  getRepositoryFiles(repositoryId: string): Promise<File[]>;
  getFile(id: string): Promise<File | undefined>;
  getFileByPath(repositoryId: string, path: string): Promise<File | undefined>;
  createFile(file: InsertFile): Promise<File>;
  updateFile(id: string, file: Partial<InsertFile>): Promise<File>;
  deleteFile(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Repository operations
  async getUserRepositories(userId: string): Promise<Repository[]> {
    return await db.select().from(repositories).where(eq(repositories.userId, userId));
  }

  async getRepository(id: string): Promise<Repository | undefined> {
    const [repository] = await db.select().from(repositories).where(eq(repositories.id, id));
    return repository;
  }

  async createRepository(repository: InsertRepository): Promise<Repository> {
    const [newRepository] = await db.insert(repositories).values(repository).returning();
    return newRepository;
  }

  async updateRepository(id: string, repository: Partial<InsertRepository>): Promise<Repository> {
    const [updatedRepository] = await db
      .update(repositories)
      .set({ ...repository, updatedAt: new Date() })
      .where(eq(repositories.id, id))
      .returning();
    return updatedRepository;
  }

  async deleteRepository(id: string): Promise<void> {
    await db.delete(repositories).where(eq(repositories.id, id));
  }

  // File operations
  async getRepositoryFiles(repositoryId: string): Promise<File[]> {
    return await db.select().from(files).where(eq(files.repositoryId, repositoryId));
  }

  async getFile(id: string): Promise<File | undefined> {
    const [file] = await db.select().from(files).where(eq(files.id, id));
    return file;
  }

  async getFileByPath(repositoryId: string, path: string): Promise<File | undefined> {
    const [file] = await db.select().from(files).where(
      and(eq(files.repositoryId, repositoryId), eq(files.path, path))
    );
    return file;
  }

  async createFile(file: InsertFile): Promise<File> {
    const [newFile] = await db.insert(files).values(file).returning();
    return newFile;
  }

  async updateFile(id: string, file: Partial<InsertFile>): Promise<File> {
    const [updatedFile] = await db
      .update(files)
      .set({ ...file, updatedAt: new Date() })
      .where(eq(files.id, id))
      .returning();
    return updatedFile;
  }

  async deleteFile(id: string): Promise<void> {
    await db.delete(files).where(eq(files.id, id));
  }
}

export const storage = new DatabaseStorage();
