import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req) {
  try {
    const { companyEmail, appPassword, smtpHost, smtpPort, smtpSecure } = await req.json();

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: smtpSecure === 'true' ? true : false,
      auth: {
        user: companyEmail,
        pass: appPassword,
      },
    });

    await transporter.verify();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email test error:', error);
    return NextResponse.json(
      { error: error.message || 'Email test failed' },
      { status: 500 }
    );
  }
}