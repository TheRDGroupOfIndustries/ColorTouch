/**
 * WhatsApp Business API - Phone Number Registration
 * Endpoint: POST /api/integrations/whatsapp-register
 * 
 * This endpoint registers a WhatsApp phone number with Meta's Cloud API
 * using the downloaded certificate.
 * 
 * Required fields:
 * - phoneNumberId: Your WhatsApp Business phone number ID
 * - accessToken: Meta Cloud API access token
 * - pin: 6-digit Two-Step Verification PIN from WhatsApp Manager
 * - certificate: Base64-encoded certificate (from cert file)
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface WhatsAppRegistrationRequest {
  phoneNumberId: string;
  accessToken: string;
  pin: string;
  certificate: string;
  displayName?: string;
}

interface MetaRegistrationResponse {
  success?: boolean;
  message?: string;
  error?: {
    message: string;
    type: string;
    code: number;
  };
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = req.headers.get('authorization');
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: WhatsAppRegistrationRequest = await req.json();

    // Validate required fields
    if (
      !body.phoneNumberId ||
      !body.accessToken ||
      !body.pin ||
      !body.certificate
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Missing required fields: phoneNumberId, accessToken, pin, certificate',
        },
        { status: 400 }
      );
    }

    // Validate PIN is 6 digits
    if (!/^\d{6}$/.test(body.pin)) {
      return NextResponse.json(
        { success: false, error: 'PIN must be exactly 6 digits' },
        { status: 400 }
      );
    }

    console.log(
      `📱 Registering WhatsApp number: ${body.phoneNumberId}`
    );

    // Call Meta's register endpoint
    const registerResponse = await fetch(
      `https://graph.facebook.com/v22.0/${body.phoneNumberId}/register`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${body.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          pin: body.pin,
          certificate: body.certificate,
        }),
      }
    );

    const responseData: MetaRegistrationResponse = await registerResponse.json();

    if (!registerResponse.ok) {
      console.error('❌ Meta API Error:', responseData);
      return NextResponse.json(
        {
          success: false,
          error: responseData.error?.message || 'Failed to register phone number',
          code: responseData.error?.code,
        },
        { status: registerResponse.status }
      );
    }

    console.log('✅ Phone number registered successfully');

    // Store configuration in database (if you have a settings table)
    // This is optional - adjust based on your schema
    try {
      // Create or update WhatsApp config record
      const whatsappConfig = await prisma.whatsAppConfig.upsert({
        where: { phoneNumberId: body.phoneNumberId },
        update: {
          accessToken: body.accessToken,
          phoneNumberId: body.phoneNumberId,
          displayName: body.displayName || '',
          isRegistered: true,
          registeredAt: new Date(),
        },
        create: {
          phoneNumberId: body.phoneNumberId,
          accessToken: body.accessToken,
          displayName: body.displayName || '',
          isRegistered: true,
          registeredAt: new Date(),
        },
      });

      console.log('✅ Configuration saved to database');
    } catch (dbError) {
      console.warn('⚠️ Could not save to database:', dbError);
      // Don't fail the registration if DB save fails
    }

    return NextResponse.json({
      success: true,
      message: 'Phone number registered successfully',
      phoneNumberId: body.phoneNumberId,
      registeredAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ Error registering phone number:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint - Check registration status
 */
export async function GET(req: NextRequest) {
  try {
    const phoneNumberId = req.nextUrl.searchParams.get('phoneNumberId');
    const accessToken = req.nextUrl.searchParams.get('accessToken');

    if (!phoneNumberId || !accessToken) {
      return NextResponse.json(
        { success: false, error: 'Missing phoneNumberId or accessToken' },
        { status: 400 }
      );
    }

    // Check status with Meta API
    const statusResponse = await fetch(
      `https://graph.facebook.com/v22.0/${phoneNumberId}?access_token=${accessToken}&fields=account_mode,status_callback_url,status`,
      { method: 'GET' }
    );

    const statusData = await statusResponse.json();

    if (!statusResponse.ok) {
      return NextResponse.json(
        { success: false, error: statusData.error?.message },
        { status: statusResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      phoneNumberId,
      status: statusData.status,
      account_mode: statusData.account_mode,
    });
  } catch (error: any) {
    console.error('❌ Error checking status:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
