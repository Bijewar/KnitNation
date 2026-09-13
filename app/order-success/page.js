"use client"
import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import Header from "../comp/Header"
import Footer from "../comp/Footer"
import BottomNav from "../comp/BottomNav"
import { MyntraSpinner } from "../comp/MyntraLoader"
import { CheckCircle2 } from "lucide-react"

const OrderSuccessContent = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [orderId, setOrderId] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('')
  const [user, setUser] = useState(null)

  useEffect(() => {
    const orderIdParam = searchParams.get('orderId')
    const amountParam = searchParams.get('amount')
    const currencyParam = searchParams.get('currency')
    if (orderIdParam) {
      setOrderId(orderIdParam)
      setAmount(amountParam)
      setCurrency(currencyParam)
    } else {
      // If no orderId, redirect to home
      router.push('/')
    }
  }, [searchParams, router])

  const handleCartClick = () => {
    router.push('/home')
  }

  if (!orderId) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header user={user} onAccountClick={() => router.push("/login")} onCartClick={handleCartClick} />
        <div className="flex-1 flex items-center justify-center py-24">
          <MyntraSpinner text="Verifying order details..." />
        </div>
        <Footer />
        <BottomNav onBagClick={handleCartClick} />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fafbfc]">
      <Header user={user} onAccountClick={() => router.push("/login")} onCartClick={handleCartClick} />

      <main className="flex-1 pb-16 md:pb-0">
        <div className="max-w-[640px] mx-auto px-4 lg:px-8 py-10 lg:py-16">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <motion.div
              className="w-20 h-20 bg-[#e6f6ec] rounded-full flex items-center justify-center mx-auto mb-6"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.15 }}
            >
              <CheckCircle2 className="w-11 h-11 text-[#1a9c3e]" />
            </motion.div>

            <h1 className="text-2xl lg:text-3xl font-bold text-[#282c3f] uppercase tracking-wide mb-2">
              Order Placed Successfully!
            </h1>

            <p className="text-sm text-[#5a5d68] mb-8">
              Thank you for shopping with KnitNation
            </p>

            <div className="bg-white rounded-xl border border-[#eaeaec] p-6 lg:p-8 mb-8 text-left">
              <h2 className="text-sm font-bold text-[#282c3f] uppercase tracking-wide mb-5 pb-4 border-b border-[#eaeaec]">
                Order Details
              </h2>
              <div className="space-y-3">
                <p className="text-sm text-[#5a5d68]">
                  <span className="font-bold text-[#282c3f]">Order ID: </span>
                  {orderId}
                </p>
                {amount && currency && (
                  <p className="text-sm text-[#5a5d68]">
                    <span className="font-bold text-[#282c3f]">Amount Paid: </span>
                    ₹{(amount / 100).toFixed(2)} {currency.toUpperCase()}
                  </p>
                )}
                <p className="text-sm text-[#5a5d68]">
                  <span className="font-bold text-[#282c3f]">Status: </span>
                  <span className="text-[#1a9c3e] font-bold">Confirmed</span>
                </p>
                <p className="text-xs text-[#94969f] pt-3 border-t border-[#eaeaec]">
                  You will receive an email confirmation shortly with your order
                  details.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push("/order-history")}
                className="myntra-btn px-8 py-3.5 text-sm"
              >
                View Order History
              </button>
              <button
                onClick={() => router.push("/")}
                className="myntra-btn-outline px-8 py-3.5 text-sm"
              >
                Continue Shopping
              </button>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
      <BottomNav onBagClick={handleCartClick} />
    </div>
  )
}

const OrderSuccess = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <MyntraSpinner text="Loading order..." />
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  )
}

export default OrderSuccess
