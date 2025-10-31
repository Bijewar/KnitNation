"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { auth, db } from "../../firebase"
import { collection, query, where, getDocs, orderBy } from "firebase/firestore"
import { motion } from "framer-motion"
import Link from "next/link"
import hoc from '../hoc';

const OrderHistory = () => {
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser)
        fetchOrders(currentUser.uid)
      } else {
        router.push("/login")
      }
    })

    return () => unsubscribe()
  }, [router])

  const fetchOrders = async (userId) => {
    try {
      const ordersRef = collection(db, "orders")
      const q = query(
        ordersRef,
        where("userId", "==", userId)
      )
      // Note: orderBy("date", "desc") removed temporarily to avoid index requirement
      // Orders will be displayed in insertion order
      const querySnapshot = await getDocs(q)
      const ordersData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setOrders(ordersData)
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading your orders...</p>
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
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            Order History
          </h1>
          <p className="text-neutral-600 text-sm sm:text-base">
            View all your past orders and track their status.
          </p>
        </motion.div>

        {orders.length === 0 ? (
          <motion.div
            className="text-center py-12 sm:py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-neutral-900 mb-2">
              No orders yet
            </h2>
            <p className="text-neutral-600 mb-6">
              You haven't placed any orders yet. Start shopping to see your order history here.
            </p>
            <motion.button
              onClick={() => router.push("/")}
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Shopping
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            className="space-y-4 sm:space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold text-neutral-900 mb-1">
                        Order #{order.orderId}
                      </h3>
                      <p className="text-neutral-600 text-sm">
                        {order.date && order.date.seconds ? new Date(order.date.seconds * 1000).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'Date not available'}
                      </p>
                    </div>
                    <div className="mt-2 sm:mt-0 text-right">
                      <p className="text-lg sm:text-xl font-bold text-emerald-600">
                        ₹{order.total}
                      </p>
                      <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-neutral-200 pt-4">
                    <h4 className="font-semibold text-neutral-900 mb-3">Items:</h4>
                    <div className="space-y-3">
                      {order.items && order.items.length > 0 ? order.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center gap-3">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={item.imageUrl || "/placeholder.svg"}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-neutral-900 truncate">
                              {item.name}
                            </h5>
                            <p className="text-neutral-600 text-sm">
                              Quantity: {item.quantity} × ₹{item.price}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-neutral-900">
                              ₹{item.price * item.quantity}
                            </p>
                          </div>
                        </div>
                      )) : (
                        <p className="text-neutral-600 text-sm">No items found for this order</p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default hoc(OrderHistory)
