import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Auth Debug - Headers:', Object.fromEntries(req.headers.entries()));
    
    // Try different token extraction methods
    const token1 = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    const token2 = await getToken({ 
      req, 
      secret: process.env.AUTH_SECRET 
    });
    
    console.log('🔍 Token with NEXTAUTH_SECRET:', token1 ? 'FOUND' : 'NOT_FOUND');
    console.log('🔍 Token with AUTH_SECRET:', token2 ? 'FOUND' : 'NOT_FOUND');
    
    const cookies = req.cookies.getAll();
    console.log('🔍 All cookies:', cookies.map(c => ({ name: c.name, hasValue: !!c.value })));

    return NextResponse.json({ 
      success: true, 
      debug: {
        tokenWithNextAuthSecret: token1 ? {
          userId: token1.userId,
          email: token1.email,
          role: token1.role
        } : null,
        tokenWithAuthSecret: token2 ? {
          userId: token2.userId,
          email: token2.email,
          role: token2.role
        } : null,
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          NEXTAUTH_URL: process.env.NEXTAUTH_URL,
          hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
          hasAuthSecret: !!process.env.AUTH_SECRET
        },
        cookies: cookies.map(c => ({ name: c.name, hasValue: !!c.value }))
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