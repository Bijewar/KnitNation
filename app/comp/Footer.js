"use client"
import React from "react"
import Link from "next/link"
import { ShieldCheck, RefreshCcw, CreditCard } from "lucide-react"

/**
 * Myntra-style footer with real routes only.
 * (Terms & Refund pages exist only as unrouted placeholder stubs in the
 * original codebase, so they are intentionally not linked - see report.)
 */
const Footer = () => {
  return (
    <footer className="bg-[#fafbfc] border-t border-[#eaeaec] mt-12 lg:mt-16">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
        {/* Trust badges strip */}
        <div className="grid grid-cols-3 gap-4 py-8 border-b border-[#eaeaec]">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-full bg-[#f5f5f6] flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#282c3f]" />
            </span>
            <div>
              <p className="text-sm font-bold text-[#282c3f]">Quality Assured</p>
              <p className="text-xs text-[#94969f]">Genuine products</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-full bg-[#f5f5f6] flex items-center justify-center flex-shrink-0">
              <RefreshCcw className="w-5 h-5 text-[#282c3f]" />
            </span>
            <div>
              <p className="text-sm font-bold text-[#282c3f]">Easy Exchange</p>
              <p className="text-xs text-[#94969f]">Simple return process</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-full bg-[#f5f5f6] flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-5 h-5 text-[#282c3f]" />
            </span>
            <div>
              <p className="text-sm font-bold text-[#282c3f]">Secure Payments</p>
              <p className="text-xs text-[#94969f]">Powered by Razorpay</p>
            </div>
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 py-10">
          <div>
            <p className="text-xs font-bold text-[#282c3f] uppercase tracking-wide mb-4">
              Online Shopping
            </p>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-sm text-[#5a5d68] hover:text-[#282c3f] hover:underline underline-offset-2 transition-colors">
                  Women
                </Link>
              </li>
              <li>
                <Link href="/men" className="text-sm text-[#5a5d68] hover:text-[#282c3f] hover:underline underline-offset-2 transition-colors">
                  Men
                </Link>
              </li>
              <li>
                <Link href="/collection/jeans" className="text-sm text-[#5a5d68] hover:text-[#282c3f] hover:underline underline-offset-2 transition-colors">
                  Jeans
                </Link>
              </li>
              <li>
                <Link href="/subcategory/tops" className="text-sm text-[#5a5d68] hover:text-[#282c3f] hover:underline underline-offset-2 transition-colors">
                  Tops
                </Link>
              </li>
              <li>
                <Link href="/subcategory/skirts" className="text-sm text-[#5a5d68] hover:text-[#282c3f] hover:underline underline-offset-2 transition-colors">
                  Skirts
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold text-[#282c3f] uppercase tracking-wide mb-4">
              Customer Policies
            </p>
            <ul className="space-y-3">
              <li>
                <Link href="/contactus" className="text-sm text-[#5a5d68] hover:text-[#282c3f] hover:underline underline-offset-2 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/order-history" className="text-sm text-[#5a5d68] hover:text-[#282c3f] hover:underline underline-offset-2 transition-colors">
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold text-[#282c3f] uppercase tracking-wide mb-4">
              Experience
            </p>
            <ul className="space-y-3 text-sm text-[#5a5d68]">
              <li>Search products fast</li>
              <li>Save to wishlist</li>
              <li>Pincode-wise delivery</li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold text-[#282c3f] uppercase tracking-wide mb-4">
              Keep In Touch
            </p>
            <ul className="space-y-3 text-sm text-[#5a5d68]">
              <li>support@knitnation.com</li>
              <li>Mon - Sat, 10 AM to 7 PM</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-5 border-t border-[#eaeaec] flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-sm text-[#94969f]">
            © {new Date().getFullYear()} www.knitnation.com. All rights reserved.
          </p>
          <p className="text-xs text-[#94969f]">A KnitNation original experience</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
