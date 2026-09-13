"use client"
import React, { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useDispatch, useSelector } from "react-redux"
import { logout } from "../../redux/slices"
import { signOut } from "../../supabase"
import {
  User,
  Heart,
  ShoppingBag,
  Search,
  Menu,
  X,
  ChevronRight,
} from "lucide-react"

/**
 * Shared Myntra-style header.
 *
 * IMPORTANT (logic preservation):
 * - `user` is the same auth state each page already tracks via onAuthStateChanged.
 * - `onAccountClick` is the page's existing handleAccClick (redirects to /login
 *   when signed out). Called here for the signed-out case, exactly as before.
 * - `onCartClick` is the page's existing handleCartClick which opens the cart
 *   drawer with the same scroll-lock behavior. No new logic introduced.
 * - The account dropdown keeps the same entries (Order History / Logout) and the
 *   same behavior as the previous per-page dropdown.
 */

const NAV_DATA = [
  {
    label: "Women",
    href: "/",
    columns: [
      {
        heading: "Bottomwear",
        links: [{ label: "Jeans", href: "/collection/jeans" }],
      },
      {
        heading: "Topwear",
        links: [{ label: "Tops", href: "/subcategory/tops" }],
      },
      {
        heading: "Skirts & More",
        links: [{ label: "Skirts", href: "/subcategory/skirts" }],
      },
    ],
  },
  {
    label: "Men",
    href: "/men",
    columns: [
      {
        heading: "Bottomwear",
        links: [{ label: "Jeans", href: "/men" }],
      },
    ],
  },
]

const Header = ({ user, onAccountClick, onCartClick }) => {
  const router = useRouter()
  const dispatch = useDispatch()
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false)
  const [activeNav, setActiveNav] = useState(null)
  const [isAccDropdownOpen, setIsAccDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const cartItems = useSelector((state) => state.cart.items)
  const closeTimeout = useRef(null)
  const accRef = useRef(null)

  /* Render persisted-cart-dependent UI (the bag badge) only after mount so
     server HTML and first client render match - avoids hydration mismatch. */
  useEffect(() => {
    setIsMounted(true)
  }, [])

  /* hover handling with a small close delay so the panel is easy to reach */
  const openMegaMenu = (nav) => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current)
    setActiveNav(nav)
    setIsMegaMenuOpen(true)
  }
  const scheduleMegaMenuClose = () => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current)
    closeTimeout.current = setTimeout(() => {
      setIsMegaMenuOpen(false)
      setActiveNav(null)
    }, 120)
  }
  useEffect(() => {
    return () => {
      if (closeTimeout.current) clearTimeout(closeTimeout.current)
    }
  }, [])

  /* Same behavior as each page's handleAccClick: signed out -> login page,
     signed in -> toggle account dropdown. */
  const handleAccountClick = () => {
    if (user) {
      setIsAccDropdownOpen((open) => !open)
    } else if (onAccountClick) {
      onAccountClick()
    } else {
      router.push("/login")
    }
  }

  /* Same entry points the previous dropdown exposed */
  const handleDropdownClose = () => setIsAccDropdownOpen(false)

  const handleMobileMenuClick = () => setIsMobileMenuOpen((open) => !open)

  const cartCount = cartItems.length

  const iconLabelClass =
    "hidden lg:block text-[10px] font-medium text-[#282c3f] mt-0.5 leading-none"

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#eaeaec] shadow-[0_2px_8px_rgba(40,44,63,0.06)]">
      {/* ============ Desktop / main bar ============ */}
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
        <div className="flex items-center gap-4 lg:gap-8 h-[60px] lg:h-[80px]">
          {/* Mobile hamburger */}
          <button
            onClick={handleMobileMenuClick}
            className="lg:hidden p-2 -ml-2 text-[#282c3f] hover:text-[#ff3f6c] transition-colors"
            aria-label="Open menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center" aria-label="KnitNation home">
            <img className="h-7 lg:h-9 w-auto object-contain" src="/logo.png" alt="KnitNation" />
          </Link>

          {/* Desktop category nav */}
          <nav className="hidden lg:flex items-center gap-8 flex-shrink-0" onMouseLeave={scheduleMegaMenuClose}>
            {NAV_DATA.map((nav) => (
              <div
                key={nav.label}
                onMouseEnter={() => openMegaMenu(nav.label)}
                className="relative"
              >
                <Link
                  href={nav.href}
                  className={`relative text-sm font-bold tracking-wide uppercase py-2 transition-colors ${
                    activeNav === nav.label ? "text-[#282c3f]" : "text-[#282c3f]"
                  }`}
                >
                  {nav.label}
                  <span
                    className={`absolute -bottom-0.5 left-0 h-[3px] rounded-full bg-[#ff3f6c] transition-all duration-200 ${
                      activeNav === nav.label ? "w-full" : "w-0"
                    }`}
                  />
                </Link>
              </div>
            ))}
          </nav>

          {/* Search bar */}
          <div className="hidden lg:flex items-center bg-[#f5f5f6] rounded flex-1 max-w-[520px] h-10 px-3 focus-within:ring-1 focus-within:ring-[#d4d5d9] transition-shadow">
            <Search className="w-4 h-4 text-[#94969f] flex-shrink-0" />
            <input
              type="text"
              placeholder="Search for products, brands and more"
              className="bg-transparent text-sm text-[#282c3f] placeholder-[#94969f] outline-none w-full px-2"
              aria-label="Search products"
            />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1 lg:gap-5 flex-shrink-0 ml-auto">
            {/* Mobile search icon */}
            <button
              className="lg:hidden p-2 text-[#282c3f]"
              aria-label="Search"
            >
              <Search className="w-6 h-6" />
            </button>

            {/* Account */}
            <div className="relative" ref={accRef}>
              <button
                onClick={handleAccountClick}
                className="flex flex-col items-center p-2 hover:text-[#ff3f6c] text-[#282c3f] transition-colors"
                aria-label="Account"
              >
                <User className="w-5 h-5 lg:w-[22px] lg:h-[22px]" />
                <span className={iconLabelClass}>Profile</span>
              </button>

              <AnimatePresence>
                {isAccDropdownOpen && user && (
                  <motion.div
                    className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-[0_6px_24px_rgba(40,44,63,0.18)] border border-[#eaeaec] w-56 overflow-hidden origin-top-right"
                    initial={{ opacity: 0, scale: 0.96, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: -4 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                  >
                    <div className="px-4 pt-4 pb-3 border-b border-[#eaeaec]">
                      <p className="text-sm font-bold text-[#282c3f] truncate">
                        Hi, {user.email || "there"}
                      </p>
                    </div>
                    <Link
                      href="/order-history"
                      onClick={handleDropdownClose}
                      className="flex items-center justify-between px-4 py-3 text-sm text-[#282c3f] hover:bg-[#f5f5f6] transition-colors"
                    >
                      Orders
                      <ChevronRight className="w-4 h-4 text-[#94969f]" />
                    </Link>
                    {user?.email?.toLowerCase() === (process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'bijewarmanas1@gmail.com').toLowerCase() && (
                      <Link
                        href="/addproduct"
                        onClick={handleDropdownClose}
                        className="flex items-center justify-between px-4 py-3 text-sm text-[#ff3f6c] hover:bg-[#fff5f7] transition-colors font-medium"
                      >
                        Manage Products (Admin)
                        <ChevronRight className="w-4 h-4 text-[#ff3f6c]" />
                      </Link>
                    )}
                    <button
                      onClick={async () => {
                        try {
                          await signOut()
                          dispatch(logout())
                          handleDropdownClose()
                          router.push("/login")
                        } catch (err) {
                          console.error("Logout error:", err)
                          handleDropdownClose()
                        }
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-[#282c3f] hover:bg-[#f5f5f6] transition-colors border-t border-[#eaeaec]"
                    >
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Wishlist (display only - no wishlist feature in codebase yet) */}
            <button
              className="hidden lg:flex flex-col items-center p-2 hover:text-[#ff3f6c] text-[#282c3f] transition-colors"
              aria-label="Wishlist"
              title="Wishlist"
            >
              <Heart className="w-[22px] h-[22px]" />
              <span className={iconLabelClass}>Wishlist</span>
            </button>

            {/* Bag / Cart */}
            <button
              onClick={onCartClick}
              className="relative flex flex-col items-center p-2 hover:text-[#ff3f6c] text-[#282c3f] transition-colors"
              aria-label="Shopping bag"
            >
              <ShoppingBag className="w-5 h-5 lg:w-[22px] lg:h-[22px]" />
              <span className={iconLabelClass}>Bag</span>
              <AnimatePresence>
                {isMounted && cartCount > 0 && (
                  <motion.span
                    className="absolute top-0.5 right-0 lg:-top-0.5 lg:-right-0.5 bg-[#ff3f6c] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    {cartCount > 99 ? "99+" : cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Mobile sticky search row */}
        <div className="lg:hidden pb-2.5">
          <div className="flex items-center bg-[#f5f5f6] rounded h-10 px-3">
            <Search className="w-4 h-4 text-[#94969f] flex-shrink-0" />
            <input
              type="text"
              placeholder="Search for products, brands and more"
              className="bg-transparent text-sm text-[#282c3f] placeholder-[#94969f] outline-none w-full px-2"
              aria-label="Search products"
            />
          </div>
        </div>
      </div>

      {/* ============ Desktop mega menu ============ */}
      <AnimatePresence>
        {isMegaMenuOpen && activeNav && (
          <motion.div
            className="hidden lg:block absolute left-0 right-0 top-full bg-white border-t border-[#eaeaec] shadow-[0_8px_24px_rgba(40,44,63,0.10)]"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onMouseEnter={() => {
              if (closeTimeout.current) clearTimeout(closeTimeout.current)
            }}
            onMouseLeave={scheduleMegaMenuClose}
          >
            <div className="max-w-[1440px] mx-auto px-8 py-8 flex gap-16">
              {NAV_DATA.find((nav) => nav.label === activeNav)?.columns.map(
                (column) => (
                  <div key={column.heading} className="min-w-[160px]">
                    <p className="text-xs font-bold text-[#94969f] uppercase tracking-wide mb-3">
                      {column.heading}
                    </p>
                    <ul className="space-y-2.5">
                      {column.links.map((link) => (
                        <li key={link.label}>
                          <Link
                            href={link.href}
                            onClick={() => {
                              setIsMegaMenuOpen(false)
                              setActiveNav(null)
                            }}
                            className="text-sm text-[#282c3f] hover:text-[#ff3f6c] hover:underline underline-offset-2 transition-colors"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============ Mobile drawer menu ============ */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              className="lg:hidden fixed inset-0 bg-black/40 z-[60]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              className="lg:hidden fixed left-0 top-0 bottom-0 w-[85%] max-w-[340px] bg-white z-[61] overflow-y-auto"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
            >
              <div className="flex items-center justify-between px-5 h-[60px] border-b border-[#eaeaec]">
                <p className="text-sm font-bold text-[#282c3f] uppercase tracking-wide">
                  Shop by Category
                </p>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-[#282c3f]"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="py-2">
                {NAV_DATA.map((nav) => (
                  <div key={nav.label} className="border-b border-[#f5f5f6]">
                    <p className="px-5 py-3 text-xs font-bold text-[#94969f] uppercase tracking-wide">
                      {nav.label}
                    </p>
                    {nav.columns.flatMap((col) => col.links).map((link) => (
                      <Link
                        key={link.label}
                        href={nav.href === link.href ? nav.href : link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-between px-5 py-3.5 text-sm font-medium text-[#282c3f] hover:bg-[#f5f5f6] transition-colors"
                      >
                        {link.label}
                        <ChevronRight className="w-4 h-4 text-[#94969f]" />
                      </Link>
                    ))}
                  </div>
                ))}
                <Link
                  href="/order-history"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between px-5 py-3.5 text-sm font-medium text-[#282c3f] hover:bg-[#f5f5f6] transition-colors"
                >
                  Order History
                  <ChevronRight className="w-4 h-4 text-[#94969f]" />
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}

export default Header
