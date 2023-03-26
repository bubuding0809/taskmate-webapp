import { NextApiRequest, NextApiResponse } from "next";
import NextAuth, { NextAuthOptions } from "next-auth";
import { randomUUID, createHash } from "crypto";
import DiscordProvider from "next-auth/providers/discord";
import FacebookProvider from "next-auth/providers/facebook";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { env } from "../../../env.mjs";
import { prisma } from "server/db";
import Cookies from "cookies";
import { encode, decode } from "next-auth/jwt";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Initialize database adapter for NextAuth options
  const adapter = PrismaAdapter(prisma);

  // Configure NextAuth options
  const authOptions: NextAuthOptions = {
    /* 
    Database adapter is set to use Prisma via the prisma adapter.
    Next-auth uses its own database schema and we need to use the adapter 
    to make sure that the next-auth schema and the prisma schema are in sync. 
    */
    adapter,

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
        if (
          req.query.nextauth?.includes("callback") &&
          req.query.nextauth?.includes("credentials") &&
          req.method === "POST"
        ) {
          if (user) {
            const sessionToken = generate.sessionToken();
            const sessionExpiry = generate.sessionExpiry();

            await adapter.createSession({
              userId: user.id,
              sessionToken: sessionToken,
              expires: sessionExpiry,
            });

            const cookies = new Cookies(req, res);

            cookies.set("next-auth.session-token", sessionToken, {
              expires: sessionExpiry,
            });
          }
        }
        return true;
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
    Define the encryption secret used to encrypt and decrypt the JWT token
    */
    jwt: {
      encode: async ({ secret, token, maxAge }) => {
        // If we are in the credentials provider callback flow, we don't want to encode the token
        if (
          req.query.nextauth?.includes("callback") &&
          req.query.nextauth?.includes("credentials") &&
          req.method === "POST"
        ) {
          const cookies = new Cookies(req, res);
          const cookie = cookies.get("next-auth.session-token");

          return cookie ? cookie : "";
        }

        // Revert to default behaviour when not in the credentials provider callback flow
        return await encode({
          token,
          secret,
          maxAge,
        });
      },
      decode: async ({ secret, token }) => {
        // If we are in the credentials provider callback flow, we don't want to decode the token
        if (
          req.query.nextauth?.includes("callback") &&
          req.query.nextauth?.includes("credentials") &&
          req.method === "POST"
        ) {
          return null;
        }

        // Revert to default behaviour when not in the credentials provider callback flow
        return await decode({
          secret,
          token,
        });
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
      CredentialsProvider({
        // The name to display on the sign in form (e.g. 'Sign in with...')
        name: "Credentials",
        // The credentials is used to generate a suitable form on the sign in page.
        // You can specify whatever fields you are expecting to be submitted.
        // e.g. domain, username, password, 2FA token, etc.
        // You can pass any HTML attribute to the <input> tag through the object.
        credentials: {
          email: { label: "Email", type: "email", placeholder: "jsmith" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials, req) {
          // search data base for user
          const userExist = await prisma.user.findFirst({
            where: {
              email: credentials?.email ?? "",
              password: generate.hashPassword(credentials?.password ?? ""),
            },
          });

          if (userExist) {
            // Any object returned will be saved in `user` property of the JWT
            return userExist;
          } else {
            // If you return null then an error will be displayed advising the user to check their details.
            return null;

            // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
          }
        },
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
  return NextAuth(req, res, authOptions) as Promise<void>;
}

export const generate = {
  uuidv4: () => randomUUID(),
  sessionToken: () => randomUUID(),
  sessionExpiry: (time: number = 60 * 60 * 24 * 7) =>
    new Date(Date.now() + time * 1000),
  hashPassword: (password: string) =>
    createHash("sha256").update(password).digest("hex"),
};
