"use client"
import React from "react"
import { useRouter } from "next/navigation"
import Header from "../comp/Header"
import Footer from "../comp/Footer"
import { Mail, Clock, MessageCircle } from "lucide-react"

const Contact = () => {
  const router = useRouter()

  const handleAccClick = () => {
    router.push("/login")
  }

  const handleCartClick = () => {
    router.push("/home")
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header onAccountClick={handleAccClick} onCartClick={handleCartClick} />

      <main className="flex-1">
        <div className="max-w-[800px] mx-auto px-4 lg:px-8 py-10 lg:py-16">
          <h1 className="myntra-section-title mb-2">Contact Us</h1>
          <div className="auth-title-bar" />
          <p className="text-sm text-[#5a5d68] mb-10">
            We are here to help. Reach out to us through any of the channels
            below.
          </p>

          <div className="grid sm:grid-cols-3 gap-5">
            <div className="bg-white rounded-xl border border-[#eaeaec] p-6 text-center hover:shadow-card-hover transition-shadow">
              <div className="w-12 h-12 rounded-full bg-[#fff0f4] flex items-center justify-center mx-auto mb-4">
                <Mail className="w-5 h-5 text-[#ff3f6c]" />
              </div>
              <p className="text-sm font-bold text-[#282c3f] mb-1">Email</p>
              <p className="text-sm text-[#5a5d68]">support@knitnation.com</p>
            </div>
            <div className="bg-white rounded-xl border border-[#eaeaec] p-6 text-center hover:shadow-card-hover transition-shadow">
              <div className="w-12 h-12 rounded-full bg-[#fff0f4] flex items-center justify-center mx-auto mb-4">
                <Clock className="w-5 h-5 text-[#ff3f6c]" />
              </div>
              <p className="text-sm font-bold text-[#282c3f] mb-1">Support Hours</p>
              <p className="text-sm text-[#5a5d68]">Mon - Sat, 10 AM to 7 PM</p>
            </div>
            <div className="bg-white rounded-xl border border-[#eaeaec] p-6 text-center hover:shadow-card-hover transition-shadow">
              <div className="w-12 h-12 rounded-full bg-[#fff0f4] flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-5 h-5 text-[#ff3f6c]" />
              </div>
              <p className="text-sm font-bold text-[#282c3f] mb-1">Orders</p>
              <p className="text-sm text-[#5a5d68]">Track them in Order History</p>
            </div>
          </div>

          <div className="mt-10 bg-[#fafbfc] rounded-xl border border-[#eaeaec] p-6">
            <p className="text-sm text-[#5a5d68] leading-relaxed">
              Have a question about a product, your order, returns or anything
              else? Write to us and our support team will get back to you as
              soon as possible. Your data is secure and encrypted.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Contact
