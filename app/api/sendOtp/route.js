import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Global store for OTPs so it persists across Next.js route handlers
global._otpStore = global._otpStore || new Map();
export const otpStore = global._otpStore;

// ✅ Generate a random 4-digit OTP
const generateOtp = () => Math.floor(1000 + Math.random() * 9000).toString();

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const otp = generateOtp();

    otpStore.set(email, {
      otp,
      timestamp: Date.now(),
      attempts: 0,
    });

    const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
    const smtpPass = (process.env.SMTP_PASS || process.env.EMAIL_PASS)?.trim();
    const emailFrom = process.env.EMAIL_FROM || smtpUser;

    // ✅ Setup Gmail transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // ✅ Send email
    await transporter.sendMail({
      from: emailFrom,
      to: email,
      subject: "Your 4-digit OTP Code",
      html: `
        <div style="font-family:Arial; max-width:600px; margin:auto; padding:20px; border:1px solid #eee; border-radius:8px;">
          <h2>Email Verification Code</h2>
          <p>Your verification code is:</p>
          <h1 style="color:#4CAF50; font-size:36px; letter-spacing:4px;">${otp}</h1>
          <p>This code will expire in 10 minutes.</p>
        </div>
      `,
    });

    console.log(`✅ OTP sent to ${email}: ${otp}`);

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Send OTP Error:", error);
    return NextResponse.json(
      { error: "Failed to send OTP", details: error.message },
      { status: 500 }
    );
  }
}
