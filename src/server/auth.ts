import type { GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import FacebookProvider from "next-auth/providers/facebook";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { env } from "../env.mjs";
import { prisma } from "./db";
/**
 * Module augmentation for `next-auth` types.
 * Allows us to add custom properties to the `session` object and keep type
 * safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 **/
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks,
 * etc.
 *
 * @see https://next-auth.js.org/configuration/options
 **/
export const authOptions: NextAuthOptions = {
  /* 
  Database adapter is set to use Prisma via the prisma adapter.
  Next-auth uses its own database schema and we need to use the adapter 
  to make sure that the next-auth schema and the prisma schema are in sync. 
  */
  adapter: PrismaAdapter(prisma),

  /* Session strategy is to write to a database via prisma adapter, other options include JWT */
  session: {
    strategy: "database",
  },

  /*
  Define callback functions that are called when a user is signed in, get session, etc... or encounters an error
  This callbacks are accessible via the the provided next-auth hooks or at /api/auth/[callback] 
  */
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        // session.user.role = user.role; <-- put other properties on the session here
      }
      return session;
    },
    async signIn({ user, account, profile, email, credentials }) {
      await new Promise((resolve) => resolve("user"));
      const isAllowedToSignIn = true;
      if (isAllowedToSignIn) {
        return true;
      } else {
        // Return false to display a default error message
        return false;
        // Or you can return a URL to redirect to:
        // return '/unauthorized'
      }
    },
    async redirect({ url, baseUrl }) {
      await new Promise((resolve) => resolve("url"));
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  /* 
  Define the providers you want to use for authentication
  Each provider has its own configuration options
  Providers includes options for OAuth, OpenID, email, credentials, etc. 
  */
  providers: [
    DiscordProvider({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
    }),
    FacebookProvider({
      clientId: env.FACEBOOK_CLIENT_ID,
      clientSecret: env.FACEBOOK_CLIENT_SECRET,
    }),
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    /**
     * ...add more providers here
     *
     * Most other providers require a bit more work than the Discord provider.
     * For example, the GitHub provider requires you to add the
     * `refresh_token_expires_in` field to the Account model. Refer to the
     * NextAuth.js docs for the provider you want to use. Example:
     * @see https://next-auth.js.org/providers/github
     **/
  ],

  // The pages object allows you to override the default pages and their URLs.
  pages: {
    signIn: "/auth/signin",
  },

  // Events are includes callbacks for specific authentication events, they are useful for logging
  events: {
    signIn({ account, user, isNewUser, profile }) {
      console.log("signIn event", account, user, isNewUser, profile, "\n\n");
    },
    createUser({ user }) {
      console.log("createUser event", user, "\n\n");
    },
    updateUser({ user }) {
      console.log("updateUser event", user, "\n\n");
    },
    linkAccount({ account, user, profile }) {
      console.log("linkAccount event", account, user, profile, "\n\n");
    },
  },
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the
 * `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 **/
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
