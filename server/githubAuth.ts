import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import lusca from "lusca";
import { storage } from "./storage";

if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
  throw new Error("Environment variables GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET are required");
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}


export function getCsrfProtection() {
  return lusca.csrf();
}

interface GitHubProfile {
  id: string;
  username: string;
  displayName: string;
  emails?: { value: string; primary?: boolean }[];
  photos?: { value: string }[];
  _json?: any;
}

async function upsertUser(profile: GitHubProfile, accessToken: string) {
  const primaryEmail = profile.emails?.find(email => email.primary)?.value || 
                      profile.emails?.[0]?.value || 
                      `${profile.username}@github.local`;
  
  await storage.upsertUser({
    id: profile.id,
    email: primaryEmail,
    firstName: profile.displayName?.split(' ')[0] || profile.username,
    lastName: profile.displayName?.split(' ').slice(1).join(' ') || '',
    profileImageUrl: profile.photos?.[0]?.value || null,
    githubAccessToken: accessToken,
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    callbackURL: "/api/auth/github/callback",
    scope: ['user:email', 'repo', 'read:org']
  },
  async (accessToken: string, refreshToken: string, profile: GitHubProfile, done: any) => {
    try {
      await upsertUser(profile, accessToken);
      
      const user = {
        id: profile.id,
        username: profile.username,
        displayName: profile.displayName,
        email: profile.emails?.find(email => email.primary)?.value || profile.emails?.[0]?.value,
        profileImageUrl: profile.photos?.[0]?.value,
        accessToken,
        refreshToken,
      };
      
      return done(null, user);
    } catch (error) {
      console.error('GitHub OAuth error:', error);
      return done(error, null);
    }
  }));

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  // Authentication routes
  app.get("/api/login", passport.authenticate("github", { 
    scope: ['user:email', 'repo', 'read:org'] 
  }));

  app.get("/api/auth/github/callback", 
    passport.authenticate("github", { 
      failureRedirect: "/login?error=github_auth_failed" 
    }),
    (req, res) => {
      // Successful authentication
      res.redirect("/?github_connected=true");
    }
  );

  app.get("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error('Logout error:', err);
      }
      res.redirect("/");
    });
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};