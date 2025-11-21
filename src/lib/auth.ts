import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs"; // Install: npm install bcryptjs
import "@/lib/env-check"; // Debug environment variables

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true, // Required for deployment
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
        // Only admin@colortouch.app with Admin@123! gets ADMIN role
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
          // Admin credentials - allow login even if DB is unreachable
          try {
            const user = await prisma.user.findUnique({
              where: { email: email as string },
            });

            if (user && user.password) {
              const isValidPassword = await bcrypt.compare(password as string, user.password);
              if (isValidPassword) {
                return {
                  id: user.id,
                  email: user.email,
                  name: user.name,
                  role: "ADMIN", // Force ADMIN role for admin credentials
                };
              }
            }
          } catch (dbErr: any) {
            console.error('Database unreachable during admin login, using fallback:', dbErr?.message || dbErr);
          }

          // If admin credentials but no user in DB or DB unreachable, allow admin login
          return {
            id: "env-admin",
            email: email as string,
            name: process.env.ADMIN_NAME || "Admin",
            role: "ADMIN",
          };
        }

        // For all other credentials, find user and assign EMPLOYEE role
        try {
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
            role: "EMPLOYEE", // Force EMPLOYEE role for all non-admin credentials
          };
        } catch (dbErr: any) {
          console.error('Database error during employee login:', dbErr?.message || dbErr);
          throw new Error("Invalid email or password or database unavailable");
        }
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
        // Determine role: only admin@colortouch.app gets ADMIN role, all others are EMPLOYEE
        const role = user.email === process.env.ADMIN_EMAIL ? "ADMIN" : "EMPLOYEE";
        
        await prisma.user.upsert({
          where: { email: user.email },
          update: {
            name: user.name ?? "Unknown",
            role: role, // Update role on each login
            updatedAt: new Date(),
          },
          create: {
            email: user.email,
            name: user.name ?? "Unknown",
            role: role,
          },
        });
      }

      return true;
    },

    // ✅ Attach user ID to JWT (runs on token creation/refresh)
    async jwt({ token, user, trigger }) {
      // On sign-in, attach DB user data to token
      if (user?.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
            select: { id: true, role: true, name: true, email: true },
          });

          if (dbUser) {
            token.userId = dbUser.id;
            token.role = dbUser.role;
            token.name = dbUser.name;
            token.email = dbUser.email || "";
          } else {
            // If no DB user found, use the user data from the authorize function
            token.userId = user.id;
            token.role = user.role;
            token.name = user.name || "";
            token.email = user.email || "";
          }
        } catch (dbErr: any) {
          console.error('Database unreachable in JWT callback, using user data from auth:', dbErr?.message || dbErr);
          // Fallback to user data from the authorize function
          token.userId = user.id;
          token.role = user.role;
          token.name = user.name || "";
          token.email = user.email || "";
        }
      }

      // On profile update, refresh data
      if (trigger === "update") {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email! },
            select: { id: true, role: true, name: true },
          });

          if (dbUser) {
            token.userId = dbUser.id;
            token.role = dbUser.role;
            token.name = dbUser.name;
          }
        } catch (dbErr: any) {
          console.error('Database unreachable during token update:', dbErr?.message || dbErr);
          // Keep existing token data
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
