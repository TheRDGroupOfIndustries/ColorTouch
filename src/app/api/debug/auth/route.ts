import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Environment in API route:', {
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'MISSING',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT SET'
    });

    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === "production"
    });

    console.log('🔍 Token debug:', {
      tokenExists: !!token,
      tokenUserId: token?.userId,
      tokenRole: token?.role,
      tokenEmail: token?.email
    });

    return NextResponse.json({ 
      success: true, 
      debug: {
        hasToken: !!token,
        tokenData: token ? {
          userId: token.userId,
          role: token.role,
          email: token.email
        } : null,
        environment: process.env.NODE_ENV
      }
    });
  } catch (error: any) {
    console.error('🚨 Auth debug error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}