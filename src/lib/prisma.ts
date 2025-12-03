import { PrismaClient } from "@prisma/client";


const globalForPrisma = global as unknown as { prisma?: PrismaClient };

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "info", "warn", "error"] : ["error"],
    // Add connection timeout settings for production
    ...(process.env.NODE_ENV === "production" && {
      datasources: {
        db: {
          url: process.env.DATABASE_URL + "?connection_limit=10&pool_timeout=20&connect_timeout=30",
        },
      },
    }),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Database operation wrapper with retry logic
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry for certain error types
      if (error.code === 'P2002' || error.code === 'P2025') {
        throw error;
      }
      
      if (i < maxRetries - 1) {
        console.log(`Database operation failed, retrying in ${delay}ms... (attempt ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  }
  
  throw lastError;
}

export default prisma;