"use client"
import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useDispatch } from "react-redux"
import { setUser, setError } from "../../redux/slices"
import { signIn } from "../../supabase"
import withReduxProvider from "../hoc"
import { toast, Toaster } from "react-hot-toast"
import { CgSpinner } from "react-icons/cg"
import { ShoppingBag, Heart, Zap } from "lucide-react"
import "../../style/login.css"

const LoginForm = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const dispatch = useDispatch()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await signIn(email, password)
      dispatch(setUser(data.user))
      toast.success("Logged in successfully!")
      router.push("/home")
    } catch (error) {
      dispatch(setError(error.message))
      toast.error(`Login failed: ${error.message}`)
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
            Login and experience all the benefits
          </h2>
          <p className="text-white/90 text-sm mt-4 max-w-[340px] leading-relaxed">
            Save your favourites, check out faster and track your orders - all in
            one place.
          </p>
          <div className="flex items-center gap-6 mt-8">
            <div className="flex items-center gap-2 text-white">
              <ShoppingBag className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wide">Easy bag</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <Heart className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wide">Wishlist</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wide">Fast orders</span>
            </div>
          </div>
        </div>
        <div className="relative z-10 text-white/70 text-xs">
          © {new Date().getFullYear()} www.knitnation.com
        </div>
      </div>

      {/* ============ Form panel ============ */}
      <div className="flex-1 flex items-center justify-center px-5 py-10 md:px-16">
        <div className="w-full max-w-[400px]">
          <div className="md:hidden flex justify-center mb-8">
            <img src="/logo.png" alt="KnitNation" className="h-9 w-auto object-contain" />
          </div>

          <h1 className="auth-title">Login</h1>
          <div className="auth-title-bar" />
          <p className="auth-subtitle mb-8">
            Sign in to your account to continue shopping
          </p>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            {/* Email */}
            <div className="flex flex-col">
              <label htmlFor="email" className="auth-label">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="myntra-input"
                required
              />
            </div>

            {/* Password */}
            <div className="flex flex-col">
              <label htmlFor="password" className="auth-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="myntra-input"
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="myntra-btn w-full py-3.5 mt-2"
            >
              {loading && <CgSpinner size={18} className="auth-spin" />}
              <span>{loading ? "Signing in..." : "Sign In"}</span>
            </button>

            {/* Links */}
            <div className="flex items-center justify-between gap-4 mt-4 pt-6 border-t border-[#eaeaec]">
              <Link href="/forgot-password" className="text-sm font-bold text-[#282c3f] hover:text-[#ff3f6c] transition-colors">
                Forgot password?
              </Link>
              <Link href="/register" className="text-sm font-bold text-[#282c3f] hover:text-[#ff3f6c] transition-colors">
                Create new account
                <span className="text-[#ff3f6c]"> &gt;</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default withReduxProvider(LoginForm)
