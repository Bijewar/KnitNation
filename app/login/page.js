"use client"
import React, { useState } from "react"
import Link from "next/link"
import Head from "next/head"
import { useRouter } from "next/navigation"
import { useDispatch } from "react-redux"
import { signInWithEmailAndPassword } from "firebase/auth"
import { setUser, setError } from "../../redux/slices"
import { auth } from "../../firebase"
import withReduxProvider from "../hoc"
import { toast, Toaster } from "react-hot-toast"
import Layout from "../layout"
import { CgSpinner } from "react-icons/cg"

const LoginForm = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" && window.innerWidth < 768)

  const router = useRouter()
  const dispatch = useDispatch()

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      dispatch(setUser(userCredential.user))
      toast.success("Logged in successfully!")
      router.push("/home")
    } catch (error) {
      dispatch(setError(error.message))
      toast.error(`Login failed: ${error.message}`)
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

  const inputFocusStyle = {
    ...inputStyle,
    borderColor: "#1a1a1a",
    backgroundColor: "#ffffff",
    boxShadow: "0 0 0 3px rgba(26, 26, 26, 0.05)",
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
  }

  const buttonHoverStyle = {
    ...buttonStyle,
    backgroundColor: loading ? "#1a1a1a" : "#333333",
    transform: loading ? "none" : "translateY(-2px)",
    boxShadow: loading ? "none" : "0 8px 20px rgba(26, 26, 26, 0.15)",
  }

  const linkContainerStyle = {
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    gap: isMobile ? "12px" : "16px",
    marginTop: "32px",
    paddingTop: "24px",
    borderTop: "1px solid #e0e0e0",
    alignItems: isMobile ? "stretch" : "center",
    justifyContent: isMobile ? "flex-start" : "space-between",
  }

  const forgotPasswordLinkStyle = {
    fontSize: "14px",
    color: "#1a1a1a",
    textDecoration: "none",
    fontWeight: "500",
    transition: "all 0.3s ease",
    borderBottom: "2px solid transparent",
    paddingBottom: "2px",
  }

  const forgotPasswordHoverStyle = {
    ...forgotPasswordLinkStyle,
    color: "#666666",
    borderBottomColor: "#1a1a1a",
  }

  const signupLinkStyle = {
    fontSize: "14px",
    color: "#1a1a1a",
    textDecoration: "none",
    fontWeight: "500",
    transition: "all 0.3s ease",
    borderBottom: "2px solid transparent",
    paddingBottom: "2px",
  }

  const signupHoverStyle = {
    ...signupLinkStyle,
    color: "#666666",
    borderBottomColor: "#1a1a1a",
  }

  const spinnerStyle = {
    animation: "spin 1s linear infinite",
  }

  return (
    <Layout>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Login</title>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </Head>

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
              <h1 style={titleStyle}>Welcome Back</h1>
              <p style={subtitleStyle}>Sign in to your account to continue shopping</p>

              <form onSubmit={handleLogin} style={formStyle}>
                {/* Email Field */}
                <div style={formGroupStyle}>
                  <label htmlFor="email" style={labelStyle}>
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={(e) => (e.target.style.borderColor = "#1a1a1a")}
                    onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                    style={inputStyle}
                    required
                  />
                </div>

                {/* Password Field */}
                <div style={formGroupStyle}>
                  <label htmlFor="password" style={labelStyle}>
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={(e) => (e.target.style.borderColor = "#1a1a1a")}
                    onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                    style={inputStyle}
                    required
                  />
                </div>

                {/* Login Button */}
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
                  <span>{loading ? "Signing in..." : "Sign In"}</span>
                </button>

                {/* Links */}
                <div style={linkContainerStyle}>
                  <Link
                    href="/forgot-password"
                    style={forgotPasswordLinkStyle}
                    onMouseEnter={(e) => {
                      e.target.style.color = "#666666"
                      e.target.style.borderBottomColor = "#1a1a1a"
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = "#1a1a1a"
                      e.target.style.borderBottomColor = "transparent"
                    }}
                  >
                    Forgot password?
                  </Link>

                  <Link
                    href="/register"
                    style={signupLinkStyle}
                    onMouseEnter={(e) => {
                      e.target.style.color = "#666666"
                      e.target.style.borderBottomColor = "#1a1a1a"
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = "#1a1a1a"
                      e.target.style.borderBottomColor = "transparent"
                    }}
                  >
                    Create new account
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default withReduxProvider(LoginForm)
