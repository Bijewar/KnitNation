"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Toaster, toast } from "react-hot-toast"
import dynamic from "next/dynamic"
import { useDispatch } from "react-redux"
import Layout from "../layout"
import { setUser } from "../../redux/slices"
import { BsFillShieldLockFill } from "react-icons/bs"
import Link from "next/link"
import { CgSpinner } from "react-icons/cg"
import withReduxProvider from "../hoc"
import PhoneInput from "react-phone-number-input"
import "react-phone-number-input/style.css"
const OtpInput = dynamic(() => import("otp-input-react"), { ssr: false })

const RegistrationForm = () => {
  const [email, setEmail] = useState("")
  const [fullName, setFullName] = useState("")
  const [password, setPassword] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [otp, setOtp] = useState("")
  const [showOtpInput, setShowOtpInput] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" && window.innerWidth < 768)
  const router = useRouter()
  const dispatch = useDispatch()

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    const initFirebase = async () => {
      const { initializeApp } = await import("firebase/app")
      const { getAuth } = await import("firebase/auth")
      const { addUserToFirestore } = await import("../../stores")
      const auth = getAuth()
      auth.languageCode = "en"

      window.firebaseAuth = auth
      window.addUserToFirestore = addUserToFirestore
    }

    if (typeof window !== "undefined") {
      initFirebase()
    }
  }, [])

  const sendOtp = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/sendOtp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        throw new Error(`Failed to send OTP: ${response.statusText}`)
      }

      const data = await response.json()
      toast.success(data.message)
      setShowOtpInput(true)
    } catch (err) {
      console.error("Error sending OTP:", err)
      toast.error(err.message || "An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (typeof window === "undefined") return
    setLoading(true)
    try {
      const { signInWithEmailLink, createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth")

      const userCredential = await createUserWithEmailAndPassword(window.firebaseAuth, email, password)
      const user = userCredential.user
      await updateProfile(user, { displayName: fullName })
      await window.addUserToFirestore(user.uid, email, fullName, phoneNumber)

      dispatch(setUser(user))
      router.push("/home")
    } catch (error) {
      console.error("Error in registration process:", error)
      toast.error(`Error in registration: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const containerStyle = {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)",
    padding: isMobile ? "20px" : "40px",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  }

  const wrapperStyle = {
    display: "flex",
    width: "100%",
    maxWidth: "1200px",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.08)",
    backgroundColor: "#ffffff",
    flexDirection: isMobile ? "column" : "row",
  }

  const imageWrapperStyle = {
    flex: isMobile ? "0" : "1",
    display: isMobile ? "none" : "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #1a1a1a 0%, #fff 100%)",
    padding: "60px 40px",
    minHeight: isMobile ? "0" : "600px",
  }

  const logoStyle = {
    maxWidth: "100%",
    height: "auto",
    maxHeight: "200px",
    objectFit: "contain",
  }

  const formWrapperStyle = {
    flex: isMobile ? "1" : "1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: isMobile ? "40px 24px" : "60px 80px",
    minHeight: isMobile ? "auto" : "600px",
  }

  const formInnerStyle = {
    width: "100%",
    maxWidth: "420px",
  }

  const titleStyle = {
    fontSize: isMobile ? "28px" : "36px",
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: "12px",
    letterSpacing: "-0.5px",
    lineHeight: "1.2",
  }

  const subtitleStyle = {
    fontSize: "14px",
    color: "#666666",
    marginBottom: "40px",
    lineHeight: "1.6",
  }

  const formStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  }

  const formGroupStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  }

  const labelStyle = {
    fontSize: "13px",
    fontWeight: "600",
    color: "#333333",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  }

  const inputStyle = {
    padding: "14px 16px",
    fontSize: "15px",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    backgroundColor: "#fafafa",
    color: "#1a1a1a",
    transition: "all 0.3s ease",
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
  }

  const buttonStyle = {
    padding: "14px 24px",
    fontSize: "15px",
    fontWeight: "600",
    backgroundColor: "#1a1a1a",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    cursor: loading ? "not-allowed" : "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    opacity: loading ? "0.7" : "1",
    marginTop: "8px",
    width: "100%",
  }

  const linkContainerStyle = {
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    gap: isMobile ? "12px" : "16px",
    marginTop: "32px",
    paddingTop: "24px",
    borderTop: "1px solid #e0e0e0",
    alignItems: isMobile ? "stretch" : "center",
    justifyContent: isMobile ? "flex-start" : "center",
    textAlign: "center",
  }

  const linkStyle = {
    fontSize: "14px",
    color: "#1a1a1a",
    textDecoration: "none",
    fontWeight: "500",
    transition: "all 0.3s ease",
    borderBottom: "2px solid transparent",
    paddingBottom: "2px",
  }

  const securityNoteStyle = {
    marginTop: "32px",
    paddingTop: "24px",
    borderTop: "1px solid #e0e0e0",
    fontSize: "12px",
    color: "#999999",
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  }

  const shieldIconStyle = {
    color: "#1a1a1a",
  }

  const otpContainerStyle = {
    display: "flex",
    justifyContent: "center",
    marginBottom: "32px",
    width: "100%",
    overflowX: "auto",
  }

  const otpInputWrapperStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    minWidth: "fit-content",
  }

  const shieldCircleStyle = {
    backgroundColor: "#f5f5f5",
    borderRadius: "50%",
    padding: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }

  const otpVerificationTitleStyle = {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: "8px",
    textAlign: "center",
  }

  const otpVerificationSubtitleStyle = {
    fontSize: "14px",
    color: "#666666",
    textAlign: "center",
    marginBottom: "32px",
  }

  const spinnerStyle = {
    animation: "spin 1s linear infinite",
  }

  return (
    <Layout>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div style={containerStyle}>
        <Toaster toastOptions={{ duration: 4000 }} />

        <div style={wrapperStyle}>
          {/* Logo Section */}
          <div style={imageWrapperStyle}>
            <img src="/logo.png" alt="Logo" style={logoStyle} />
          </div>

          {/* Form Section */}
          <div style={formWrapperStyle}>
            <div style={formInnerStyle}>
              <h1 style={titleStyle}>{showOtpInput ? "Verify Email" : "Create Account"}</h1>
              <p style={subtitleStyle}>
                {showOtpInput ? "Enter the verification code sent to your email" : "Sign up to start shopping with us"}
              </p>

              <form onSubmit={showOtpInput ? handleVerifyOtp : sendOtp} style={formStyle}>
                {!showOtpInput ? (
                  <>
                    {/* Full Name Input */}
                    <div style={formGroupStyle}>
                      <label htmlFor="name" style={labelStyle}>
                        Full Name
                      </label>
                      <input
                        id="name"
                        placeholder="John Doe"
                        required
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        onFocus={(e) => (e.target.style.borderColor = "#1a1a1a")}
                        onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                        style={inputStyle}
                      />
                    </div>

                    {/* Email Input */}
                    <div style={formGroupStyle}>
                      <label htmlFor="email" style={labelStyle}>
                        Email Address
                      </label>
                      <input
                        id="email"
                        placeholder="you@example.com"
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={(e) => (e.target.style.borderColor = "#1a1a1a")}
                        onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                        style={inputStyle}
                      />
                    </div>

                    {/* Password Input */}
                    <div style={formGroupStyle}>
                      <label htmlFor="password" style={labelStyle}>
                        Password
                      </label>
                      <input
                        id="password"
                        placeholder="••••••••"
                        required
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={(e) => (e.target.style.borderColor = "#1a1a1a")}
                        onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                        style={inputStyle}
                      />
                    </div>

                    {/* Phone Number Input */}
                    <div style={formGroupStyle}>
                      <label htmlFor="phone" style={labelStyle}>
                        Phone Number
                      </label>
                      <PhoneInput
                        placeholder="Enter phone number"
                        value={phoneNumber}
                        onChange={setPhoneNumber}
                        defaultCountry="IN"
                        international
                        required
                        style={inputStyle}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      style={buttonStyle}
                      onMouseEnter={(e) => {
                        if (!loading) {
                          e.target.style.backgroundColor = "#333333"
                          e.target.style.transform = "translateY(-2px)"
                          e.target.style.boxShadow = "0 8px 20px rgba(26, 26, 26, 0.15)"
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "#1a1a1a"
                        e.target.style.transform = "translateY(0)"
                        e.target.style.boxShadow = "none"
                      }}
                    >
                      {loading && <CgSpinner size={18} style={spinnerStyle} />}
                      <span>{loading ? "Sending..." : "Send OTP via Email"}</span>
                    </button>

                    <div style={linkContainerStyle}>
                      <p style={{ fontSize: "14px", color: "#666666", margin: "0" }}>
                        Already have an account?{" "}
                        <Link
                          href="/login"
                          style={linkStyle}
                          onMouseEnter={(e) => {
                            e.target.style.color = "#666666"
                            e.target.style.borderBottomColor = "#1a1a1a"
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.color = "#1a1a1a"
                            e.target.style.borderBottomColor = "transparent"
                          }}
                        >
                          Sign in
                        </Link>
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    {/* OTP Verification Section */}
                    <div style={otpContainerStyle}>
                      <div style={shieldCircleStyle}>
                        <BsFillShieldLockFill size={32} style={shieldIconStyle} />
                      </div>
                    </div>

                    <h2 style={otpVerificationTitleStyle}>Email Verification</h2>
                    <p style={otpVerificationSubtitleStyle}>We've sent a 6-digit code to your email</p>

                    {/* OTP Input */}
                    <div style={otpContainerStyle}>
                      <div style={otpInputWrapperStyle}>
                        <OtpInput
                          value={otp}
                          onChange={setOtp}
                          numInputs={6}
                          separator={<span style={{ margin: "0 4px" }}>-</span>}
                          inputStyle={{
                            width: "48px",
                            height: "48px",
                            margin: "0 4px",
                            fontSize: "24px",
                            borderRadius: "8px",
                            border: "2px solid #e0e0e0",
                            backgroundColor: "#fafafa",
                            color: "#1a1a1a",
                            fontWeight: "600",
                            transition: "all 0.3s ease",
                          }}
                          focusStyle={{
                            borderColor: "#1a1a1a",
                            backgroundColor: "#ffffff",
                          }}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      style={buttonStyle}
                      onMouseEnter={(e) => {
                        if (!loading) {
                          e.target.style.backgroundColor = "#333333"
                          e.target.style.transform = "translateY(-2px)"
                          e.target.style.boxShadow = "0 8px 20px rgba(26, 26, 26, 0.15)"
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "#1a1a1a"
                        e.target.style.transform = "translateY(0)"
                        e.target.style.boxShadow = "none"
                      }}
                    >
                      {loading && <CgSpinner size={18} style={spinnerStyle} />}
                      <span>{loading ? "Verifying..." : "Verify Email"}</span>
                    </button>

                    {/* Resend OTP Link */}
                    <p style={{ textAlign: "center", color: "#666666", fontSize: "14px", marginTop: "24px" }}>
                      Didn't receive the code?{" "}
                      <button
                        type="button"
                        onClick={sendOtp}
                        style={{
                          ...linkStyle,
                          background: "none",
                          padding: "0",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.color = "#666666"
                          e.target.style.borderBottomColor = "#1a1a1a"
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.color = "#1a1a1a"
                          e.target.style.borderBottomColor = "transparent"
                        }}
                      >
                        Resend OTP
                      </button>
                    </p>
                  </>
                )}
              </form>

              {/* Security Note */}
              <div style={securityNoteStyle}>
                <BsFillShieldLockFill size={14} style={shieldIconStyle} />
                <span>Your data is secure and encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default withReduxProvider(RegistrationForm)
