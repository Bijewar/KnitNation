"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Toaster, toast } from "react-hot-toast"
import { useDispatch } from "react-redux"
import { setUser } from "../../redux/slices"
import { BsFillShieldLockFill } from "react-icons/bs"
import Link from "next/link"
import { CgSpinner } from "react-icons/cg"
import withReduxProvider from "../hoc"
import PhoneInput from "react-phone-number-input"
import "react-phone-number-input/style.css"
import { ShoppingBag, Heart, Zap, Mail, ArrowLeft, CheckCircle2 } from "lucide-react"
import "../../style/login.css"
import "../../style/register.css"
import { signUp } from "../../supabase"

// Robust 4-digit segmented OTP Box component with native inputs
const SegmentedOtpInput = ({ value = "", onChange, placeholder = "•" }) => {
  const inputsRef = useRef([])

  const handleDigitChange = (index, val) => {
    const clean = val.replace(/\D/g, "")
    if (!clean) {
      const arr = (value || "").split("")
      arr[index] = ""
      onChange(arr.join("").trim())
      return
    }
    const lastChar = clean[clean.length - 1]
    const arr = (value || "").padEnd(4, " ").split("")
    arr[index] = lastChar
    const updated = arr.join("").trim()
    onChange(updated)
    if (index < 3 && lastChar) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && (!value[index] || value[index] === " ") && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4)
    if (pasted) {
      onChange(pasted)
      const nextIdx = Math.min(pasted.length, 3)
      inputsRef.current[nextIdx]?.focus()
    }
  }

  return (
    <div className="flex items-center justify-center gap-3 my-3" onPaste={handlePaste}>
      {[0, 1, 2, 3].map((idx) => (
        <input
          key={idx}
          ref={(el) => (inputsRef.current[idx] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          placeholder={placeholder}
          value={value[idx] || ""}
          onChange={(e) => handleDigitChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          className="w-13 h-14 text-center text-2xl font-bold border-2 border-[#d4d5d9] rounded-lg focus:border-[#ff3f6c] focus:outline-none transition-all text-[#282c3f] bg-white placeholder:text-[#d4d5d9]"
        />
      ))}
    </div>
  )
}

const RegistrationForm = () => {
  const [email, setEmail] = useState("")
  const [fullName, setFullName] = useState("")
  const [password, setPassword] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [showOtpScreen, setShowOtpScreen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const router = useRouter()
  const dispatch = useDispatch()
  const otpInputRef = useRef(null)

  // Countdown timer for Resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // Send OTP handler
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault()

    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address first.")
      return false
    }

    setOtpLoading(true)
    try {
      const response = await fetch("/api/sendOtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details || "Failed to send OTP")
      }

      setOtpSent(true)
      setCountdown(30)
      toast.success(data.message || "OTP sent successfully to your email!")
      
      // Auto-focus the OTP placeholder input
      setTimeout(() => {
        otpInputRef.current?.focus()
      }, 100)
      return true
    } catch (err) {
      console.error("Error sending OTP:", err)
      toast.error(err.message || "Failed to send OTP. Please check your credentials.")
      return false
    } finally {
      setOtpLoading(false)
    }
  }

  // Handle transition to dedicated OTP screen
  const handleProceedToOtpScreen = async (e) => {
    e.preventDefault()
    if (!fullName || !email || !password || !phoneNumber) {
      toast.error("Please fill in all registration fields.")
      return
    }

    if (!otpSent) {
      const sent = await handleSendOtp()
      if (sent) setShowOtpScreen(true)
    } else {
      setShowOtpScreen(true)
    }
  }

  // Registration & OTP Verification flow
  const handleRegister = async (e) => {
    e.preventDefault()

    if (!fullName || !email || !password) {
      toast.error("Please fill in all required fields.")
      return
    }

    const cleanOtp = otp.trim()
    if (!cleanOtp) {
      toast.error("Please enter the 4-digit OTP sent to your email.")
      otpInputRef.current?.focus()
      return
    }

    setLoading(true)
    try {
      // 1. Verify OTP with backend
      const verifyRes = await fetch("/api/verifyOtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: cleanOtp }),
      })

      const verifyData = await verifyRes.json()

      if (!verifyRes.ok) {
        throw new Error(verifyData.error || "Invalid OTP code.")
      }

      // 2. Register user in Supabase
      const data = await signUp(email, password, {
        full_name: fullName,
        phone_number: phoneNumber,
      })

      if (data?.user) {
        dispatch(setUser(data.user))
      }

      toast.success("Account created successfully! Welcome to KnitNation.")
      router.push("/home")
    } catch (error) {
      console.error("Error in registration:", error)
      toast.error(error.message || "Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-white">
      <Toaster toastOptions={{ duration: 4000 }} />

      {/* ============ Brand panel (desktop only) ============ */}
      <div className="hidden md:flex auth-brand-panel w-1/2 flex-col justify-between p-12">
        <div className="relative z-10">
          <img src="/logo.png" alt="KnitNation" className="h-10 w-auto object-contain brightness-0 invert" />
        </div>
        <div className="relative z-10">
          <h2 className="text-white text-3xl font-bold leading-tight max-w-[380px]">
            Looks like you&apos;re new here!
          </h2>
          <p className="text-white/90 text-sm mt-4 max-w-[340px] leading-relaxed">
            Sign up with your verified email to explore premium apparel and curated fashion.
          </p>
          <div className="flex items-center gap-6 mt-8">
            <div className="flex items-center gap-2 text-white">
              <ShoppingBag className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wide">Easy Bag</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <Heart className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wide">Wishlist</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wide">Instant Checkout</span>
            </div>
          </div>
        </div>
        <div className="relative z-10 text-white/70 text-xs">
          © {new Date().getFullYear()} www.knitnation.com • Powered by Supabase & Razorpay
        </div>
      </div>

      {/* ============ Form panel ============ */}
      <div className="flex-1 flex items-center justify-center px-5 py-10 md:px-16 overflow-y-auto">
        <div className="w-full max-w-[430px]">
          <div className="md:hidden flex justify-center mb-6">
            <img src="/logo.png" alt="KnitNation" className="h-9 w-auto object-contain" />
          </div>

          {!showOtpScreen ? (
            /* ========================================================
               SCREEN 1: All-In-One Form with Explicit OTP Placeholder
               ======================================================== */
            <>
              <h1 className="auth-title">Create Account</h1>
              <div className="auth-title-bar" />
              <p className="auth-subtitle mb-6">
                Sign up with your email to start shopping with KnitNation
              </p>

              <form onSubmit={handleRegister} className="flex flex-col gap-4">
                {/* Full Name */}
                <div className="flex flex-col">
                  <label htmlFor="name" className="auth-label">
                    Full Name
                  </label>
                  <input
                    id="name"
                    placeholder="Enter your full name (e.g. John Doe)"
                    required
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="myntra-input"
                  />
                </div>

                {/* Email Address */}
                <div className="flex flex-col">
                  <label htmlFor="email" className="auth-label">
                    Email Address
                  </label>
                  <input
                    id="email"
                    placeholder="you@example.com"
                    required
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (otpSent) setOtpSent(false)
                    }}
                    className="myntra-input"
                  />
                </div>

                {/* OTP Section with Explicit Placeholder & Inline Action */}
                <div className="flex flex-col bg-[#fdf8fa] p-3.5 rounded-lg border border-[#f5d0dc]">
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="otp" className="auth-label !mb-0 flex items-center gap-1.5 text-[#ff3f6c]">
                      <BsFillShieldLockFill size={14} />
                      Email Verification OTP
                    </label>
                    {otpSent && (
                      <span className="text-[11px] font-semibold text-[#1a9c3e] flex items-center gap-1">
                        <CheckCircle2 size={12} /> Code Sent
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input
                      id="otp"
                      ref={otpInputRef}
                      placeholder="Enter 4-digit OTP"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={4}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      className="myntra-input font-bold tracking-widest text-center text-lg !bg-white border-[#e0bfcb] focus:border-[#ff3f6c]"
                    />
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={otpLoading || countdown > 0}
                      className="px-3.5 py-2 text-xs font-bold whitespace-nowrap uppercase tracking-wider rounded border border-[#ff3f6c] text-[#ff3f6c] bg-white hover:bg-[#fff0f4] disabled:opacity-50 transition-colors flex items-center justify-center min-w-[100px]"
                    >
                      {otpLoading ? (
                        <CgSpinner size={16} className="auth-spin" />
                      ) : countdown > 0 ? (
                        `Wait ${countdown}s`
                      ) : otpSent ? (
                        "Resend"
                      ) : (
                        "Send OTP"
                      )}
                    </button>
                  </div>

                  <p className="text-[11px] text-[#5a5d68] mt-1.5">
                    {otpSent
                      ? `We sent a 4-digit code to ${email}. Check your spam if not in inbox.`
                      : 'Click "Send OTP" to receive a 4-digit verification code in your email.'}
                  </p>
                </div>

                {/* Password */}
                <div className="flex flex-col">
                  <label htmlFor="password" className="auth-label">
                    Password
                  </label>
                  <input
                    id="password"
                    placeholder="Enter password (min 6 characters)"
                    required
                    minLength={6}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="myntra-input"
                  />
                </div>

                {/* Phone Number */}
                <div className="flex flex-col">
                  <label htmlFor="phone" className="auth-label">
                    Phone Number
                  </label>
                  <div className="auth-phone-input">
                    <PhoneInput
                      placeholder="Enter phone number"
                      value={phoneNumber}
                      onChange={setPhoneNumber}
                      defaultCountry="IN"
                      international
                      required
                    />
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="myntra-btn w-full py-3.5 mt-2 text-sm shadow-md hover:shadow-lg"
                >
                  {loading && <CgSpinner size={18} className="auth-spin mr-2" />}
                  <span>{loading ? "Creating Account..." : "Create Account"}</span>
                </button>

                {/* Optional dedicated OTP screen trigger */}
                {otpSent && (
                  <button
                    type="button"
                    onClick={() => setShowOtpScreen(true)}
                    className="text-center text-xs text-[#ff3f6c] font-semibold hover:underline mt-1"
                  >
                    Enter OTP in full verification view →
                  </button>
                )}

                <div className="flex items-center justify-center gap-1.5 mt-2 pt-4 border-t border-[#eaeaec] text-sm text-[#5a5d68]">
                  <span>Already have an account?</span>
                  <Link href="/login" className="auth-link">
                    Sign in
                  </Link>
                </div>
              </form>
            </>
          ) : (
            /* ========================================================
               SCREEN 2: Dedicated OTP Verification View
               ======================================================== */
            <>
              <button
                type="button"
                onClick={() => setShowOtpScreen(false)}
                className="inline-flex items-center gap-1.5 text-xs text-[#5a5d68] hover:text-[#282c3f] mb-4 font-semibold"
              >
                <ArrowLeft size={14} /> Back to details
              </button>

              <div className="flex justify-center mb-3">
                <div className="w-16 h-16 rounded-full bg-[#fff0f4] flex items-center justify-center">
                  <BsFillShieldLockFill size={28} className="text-[#ff3f6c]" />
                </div>
              </div>

              <h1 className="text-xl font-bold text-[#282c3f] text-center">
                Email Verification
              </h1>
              <p className="text-sm text-[#5a5d68] text-center mt-1 mb-6">
                Enter the 4-digit code sent to <strong className="text-[#282c3f]">{email}</strong>
              </p>

              <form onSubmit={handleRegister} className="flex flex-col gap-4">
                {/* 4-digit segmented boxes */}
                <SegmentedOtpInput
                  value={otp}
                  onChange={setOtp}
                  placeholder="•"
                />

                {/* Also explicit single input with placeholder as fallback */}
                <div className="flex flex-col mt-2">
                  <label htmlFor="otp-alt" className="auth-label text-center text-xs text-[#94969f]">
                    Or enter directly:
                  </label>
                  <input
                    id="otp-alt"
                    placeholder="Enter 4-digit OTP"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    className="myntra-input font-bold tracking-widest text-center text-lg mx-auto max-w-[200px]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length < 4}
                  className="myntra-btn w-full py-3.5 mt-4 text-sm"
                >
                  {loading && <CgSpinner size={18} className="auth-spin mr-2" />}
                  <span>{loading ? "Verifying..." : "Verify & Complete Registration"}</span>
                </button>

                <div className="text-center text-sm text-[#5a5d68] mt-3">
                  Didn&apos;t receive the code?{" "}
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpLoading || countdown > 0}
                    className="auth-link disabled:opacity-50"
                  >
                    {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Security badge */}
          <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t border-[#eaeaec] text-xs text-[#94969f]">
            <BsFillShieldLockFill size={14} className="text-[#5a5d68]" />
            <span>256-bit SSL encrypted • Instant verification</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default withReduxProvider(RegistrationForm)
