import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import prisma from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],

  callbacks: {
    // ✅ Runs once on sign-in
    async signIn({ user }) {
      if (!user.email) return false;

      await prisma.user.upsert({
        where: { email: user.email },
        update: {
          name: user.name ?? "Unknown",
          updatedAt: new Date(),
        },
        create: {
          email: user.email,
          name: user.name ?? "Unknown",
          role: "EMPLOYEE",
        },
      });

      return true;
    },

    // ✅ Attach user ID to JWT (runs on token creation/refresh)
    async jwt({ token, user, trigger }) {
      // On sign-in, attach DB user data to token
      if (user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { id: true, role: true },
        });
        
        if (dbUser) {
          token.userId = dbUser.id;
          token.role = dbUser.role;
        }
      }

      // On profile update, refresh data
      if (trigger === "update") {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email! },
          select: { id: true, role: true, name: true },
        });
        
        if (dbUser) {
          token.userId = dbUser.id;
          token.role = dbUser.role;
          token.name = dbUser.name;
        }
      }

      return token;
    },

    // ✅ Add custom data to session object (runs frequently but no DB query)
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});