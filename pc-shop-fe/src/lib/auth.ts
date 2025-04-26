import type { NextAuthOptions, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { sendRequest } from "@/utils/api";

interface IAuthUser extends User {
  accessToken?: string;
  role?: string;
}

interface ISession {
  user: IAuthUser;
}

interface APIResponse {
  ok: boolean;
  json(): Promise<IAuthUser>;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const response = await sendRequest<APIResponse>("/auth/login", {
            method: "POST",
            data: {
              email: credentials.email,
              password: credentials.password,
            },
          });

          if (!response.ok) {
            return null;
          }

          const user = await response.json();
          return user;
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: IAuthUser }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: { session: ISession; token: JWT }) {
      if (token) {
        session.user.accessToken = token.accessToken as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
}; 