import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { missingPersonId, matchedImageURL, location, confidence } = body;
    
    // In a deployed environment, use real ENV variables for SMTP
    // For this demonstration, we simulate the email dispatch success.
    
    /* 
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    });

    await transporter.sendMail({
      from: '"AI ID System" <alerts@missingpersystem.local>',
      to: 'family@test.local',
      subject: `🚨 Urgent: AI Match Detected (${confidence}%)`,
      html: `
        <h2>Pattern Match Detected</h2>
        <p>A camera at <b>${location}</b> registered a facial match above the threshold.</p>
        <img src="${matchedImageURL}" alt="Scan match" width="300" />
        <p>Please log in to your dashboard to verify this alert immediately.</p>
      `
    });
    */

    // Returning success to mock the database write + email send combo
    return NextResponse.json({ 
      success: true, 
      alertId: "alert_" + Math.random().toString(36).substr(2, 9),
      message: "Alert logged and sent to family/authorities" 
    });

  } catch (error) {
    console.error("Alert Dispatch Error:", error);
    return NextResponse.json({ error: "Internal Server Error during alert dispatch" }, { status: 500 });
  }
}
