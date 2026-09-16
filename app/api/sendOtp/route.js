import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

// Use service-role or anon key — anon is fine since RLS is disabled on otp_verifications
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

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
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Delete any existing OTP for this email (so only one active at a time)
    await supabase.from("otp_verifications").delete().eq("email", email);

    // Insert new OTP into Supabase
    const { error: insertError } = await supabase
      .from("otp_verifications")
      .insert({ email, otp, expires_at: expiresAt });

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to store OTP", details: insertError.message },
        { status: 500 }
      );
    }

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
