import { NextRequest, NextResponse } from 'next/server';

const notificationapi = require('notificationapi-node-server-sdk').default;

export async function POST(request: NextRequest) {
  try {
    // Initialize NotificationAPI
    notificationapi.init(
      process.env.NOTIFICATIONAPI_CLIENT_ID,
      process.env.NOTIFICATIONAPI_CLIENT_SECRET
    );

    // Send test SMS
    const result = await notificationapi.send({
      type: 'welcome_sms',
      to: {
        id: 'test-user',
        number: '+27623661042'
      },
      sms: {
        message: 'Test SMS from EPS System - SMS functionality is working!'
      }
    });

    console.log('✅ Test SMS sent successfully');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test SMS sent to +27623661042'
    });

  } catch (error: any) {
    console.error('❌ Test SMS failed:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'SMS test failed' 
    }, { status: 500 });
  }
}