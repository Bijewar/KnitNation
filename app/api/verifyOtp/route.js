import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function handleVerify(request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    // Fetch the stored OTP from Supabase
    const { data: rows, error: fetchError } = await supabase
      .from("otp_verifications")
      .select("*")
      .eq("email", email)
      .order("created_at", { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error("Supabase fetch error:", fetchError);
      return NextResponse.json(
        { error: "Internal server error", details: fetchError.message },
        { status: 500 }
      );
    }

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: "No OTP found for this email. Please request a new one." },
        { status: 400 }
      );
    }

    const storedData = rows[0];

    // ⏳ Expiry check
    if (new Date() > new Date(storedData.expires_at)) {
      await supabase.from("otp_verifications").delete().eq("email", email);
      return NextResponse.json(
        { error: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // ❌ Wrong OTP — increment attempts
    if (storedData.otp !== otp.trim()) {
      const newAttempts = (storedData.attempts || 0) + 1;

      if (newAttempts >= 3) {
        await supabase.from("otp_verifications").delete().eq("email", email);
        return NextResponse.json(
          { error: "Too many failed attempts. Please request a new OTP." },
          { status: 400 }
        );
      }

      await supabase
        .from("otp_verifications")
        .update({ attempts: newAttempts })
        .eq("id", storedData.id);

      return NextResponse.json(
        {
          error: "Invalid OTP",
          remainingAttempts: 3 - newAttempts,
        },
        { status: 400 }
      );
    }

    // ✅ Correct OTP — delete it so it can't be reused
    await supabase.from("otp_verifications").delete().eq("email", email);

    return NextResponse.json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

export const PUT = handleVerify;
export const POST = handleVerify;
