"use client"
import React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, User, ShoppingBag, Heart } from "lucide-react"

/**
 * Mobile bottom navigation (Myntra-style).
 * - Links point to the same existing routes used elsewhere in the app.
 * - The Bag tab calls the page's existing handleCartClick (passed as
 *   onBagClick) so the cart drawer opens with unchanged behavior.
 * - Wishlist tab is display-only (no wishlist feature in codebase - see report).
 */
const BottomNav = ({ onBagClick }) => {
  const pathname = usePathname()

  const isActive = (href) => {
    if (href === "/") return pathname === "/" || pathname === "/home"
    return pathname.startsWith(href)
  }

  const itemClass = (active) =>
    `flex flex-col items-center justify-center gap-0.5 py-1 w-full transition-colors ${
      active ? "text-[#ff3f6c]" : "text-[#5a5d68]"
    }`

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#eaeaec] shadow-[0_-2px_10px_rgba(40,44,63,0.06)] md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Bottom navigation"
    >
      <div className="grid grid-cols-5 h-[56px]">
        <Link href="/home" className={itemClass(isActive("/home"))} aria-label="Home">
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <Link href="/" className={itemClass(isActive("/"))} aria-label="Women">
          <span className="text-sm font-bold leading-none mt-0.5">W</span>
          <span className="text-[10px] font-medium">Women</span>
        </Link>
        <Link href="/men" className={itemClass(isActive("/men"))} aria-label="Men">
          <span className="text-sm font-bold leading-none mt-0.5">M</span>
          <span className="text-[10px] font-medium">Men</span>
        </Link>
        <button className={itemClass(false)} aria-label="Wishlist">
          <Heart className="w-5 h-5" />
          <span className="text-[10px] font-medium">Wishlist</span>
        </button>
        <button
          onClick={onBagClick}
          className={itemClass(false)}
          aria-label="Shopping bag"
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[10px] font-medium">Bag</span>
        </button>
      </div>
    </nav>
  )
}

export default BottomNav
