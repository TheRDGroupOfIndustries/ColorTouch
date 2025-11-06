import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs"; // Install: npm install bcryptjs

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // ✅ Email/Password Provider
    Credentials({
      name: "Email and Password",
      credentials: {
        name: { label: "Name", type: "text", placeholder: "John Doe" },
        email: { label: "Email", type: "email", placeholder: "your@email.com" },
        password: { label: "Password", type: "password" },
        action: { label: "Action", type: "hidden" }, // to differentiate login/signup
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        const { email, password, action } = credentials;

        // 🔹 SIGNUP LOGIC
        if (action === "signup") {
          // Check if user already exists
          const existingUser = await prisma.user.findUnique({
            where: { email: email as string },
          });

          if (existingUser) {
            throw new Error("User already exists. Please login.");
          }

          // Hash password
          const hashedPassword = await bcrypt.hash(password as string, 10);

          // Create new user
          const newUser = await prisma.user.create({
            data: {
              email: email as string,
              password: hashedPassword,
              name: (credentials.name as string) || (email as string).split("@")[0],
              role: "EMPLOYEE",
            },
          });

          return {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role,
          };
        }

        // 🔹 LOGIN LOGIC
        const user = await prisma.user.findUnique({
          where: { email: email as string },
        });

        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(
          password as string,
          user.password
        );

        if (!isValidPassword) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },

  callbacks: {
    // ✅ Runs once on sign-in
    async signIn({ user, account }) {
      if (!user.email) return false;

      // Only upsert for OAuth providers (Google), not for Credentials
      if (account?.provider === "google") {
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
      }

      return true;
    },

    // ✅ Attach user ID to JWT (runs on token creation/refresh)
    async jwt({ token, user, trigger }) {
      // On sign-in, attach DB user data to token
      if (user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { id: true, role: true, name: true, email: true },
        });

        if (dbUser) {
          token.userId = dbUser.id;
          token.role = dbUser.role;
          token.name = dbUser.name; // ✅ Added
          token.email = dbUser.email || ""; // ✅ Added
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
        session.user.name = token.name as string; // ✅ Add this
        session.user.email = token.email as string; // ✅ Add this
      }
      return session;
    },
  },
});
