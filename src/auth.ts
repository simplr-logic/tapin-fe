import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { env } from "@/config/env";
import demoUser from "@/data/demo-user.json";

// Mock auth — there is no backend yet. A single demo account is accepted here;
// swap `authorize` for a real API call once one exists. Everything downstream
// (session, middleware, the profile menu) is already wired against the real
// NextAuth session shape, so that swap should be the only change needed.

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = typeof credentials?.email === "string" ? credentials.email : undefined;
        const password =
          typeof credentials?.password === "string" ? credentials.password : undefined;

        if (email === env.demoUserEmail && password === env.demoUserPassword) {
          return { ...demoUser, email };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.role = token.role;
      return session;
    },
  },
});
