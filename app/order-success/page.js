"use client"
import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"

const OrderSuccessContent = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [orderId, setOrderId] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('')

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

  if (!orderId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
      {/* Header */}
      <motion.nav
        className="sticky top-0 z-50 bg-white border-b border-neutral-200 shadow-lg backdrop-blur-sm bg-opacity-95"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 md:h-20">
            <div className="flex items-center gap-4 sm:gap-6 md:gap-8">
              <Link
                href="/"
                className="text-xs sm:text-sm font-semibold text-neutral-900 hover:text-emerald-600 transition-all duration-300 relative group"
              >
                Womens
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link
                href="/men"
                className="text-xs sm:text-sm font-semibold text-neutral-900 hover:text-emerald-600 transition-all duration-300 relative group"
              >
                Mens
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </div>

            <motion.div
              className="absolute left-1/2 transform -translate-x-1/2"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <img className="h-6 sm:h-8 md:h-10 w-auto" src="/logo.png" alt="Logo" />
            </motion.div>

            <div className="flex items-center gap-2 sm:gap-3 md:gap-6">
              <motion.button
                onClick={() => router.push("/")}
                className="p-1.5 sm:p-2 hover:bg-neutral-100 rounded-full transition-colors flex-shrink-0"
                aria-label="Back to home"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 sm:w-12 sm:h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
            </svg>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            Order Placed Successfully!
          </h1>

          <p className="text-lg sm:text-xl text-neutral-600 mb-6">
            Thank you for shopping with KnitNation
          </p>

          <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 mb-4">
              Order Details
            </h2>
            <div className="text-left">
              <p className="text-neutral-600 mb-2">
                <span className="font-medium">Order ID:</span> {orderId}
              </p>
              {amount && currency && (
                <p className="text-neutral-600 mb-2">
                  <span className="font-medium">Amount Paid:</span> {(amount / 100).toFixed(2)} {currency.toUpperCase()}
                </p>
              )}
              <p className="text-neutral-600 mb-2">
                <span className="font-medium">Status:</span> <span className="text-green-600 font-semibold">Confirmed</span>
              </p>
              <p className="text-neutral-600">
                You will receive an email confirmation shortly with your order details.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              onClick={() => router.push("/order-history")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View Order History
            </motion.button>
            <motion.button
              onClick={() => router.push("/")}
              className="bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Continue Shopping
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

const OrderSuccess = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  )
}

export default OrderSuccess
