"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChange } from "../../supabase"
import { fetchOrdersForUser } from "../../stores"
import { motion } from "framer-motion"
import Link from "next/link"
import Header from "../comp/Header"
import Footer from "../comp/Footer"
import BottomNav from "../comp/BottomNav"
import { OrderHistorySkeleton } from "../comp/MyntraLoader"
import { Package, ChevronRight } from "lucide-react"
import hoc from '../hoc';

const OrderHistory = () => {
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const subscription = onAuthStateChange((currentUser) => {
      if (currentUser) {
        setUser(currentUser)
        fetchOrders(currentUser.id)
      } else {
        router.push("/login")
      }
    })

    return () => {
      if (subscription?.unsubscribe) subscription.unsubscribe()
    }
  }, [router])

  const fetchOrders = async (userId) => {
    try {
      const ordersData = await fetchOrdersForUser(userId)
      setOrders(ordersData)
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAccClick = () => {
    if (user) {
      // Header manages its own account dropdown panel
    } else {
      router.push('/login')
    }
  }

  const handleCartClick = () => {
    router.push('/home')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fafbfc]">
        <Header user={user} onAccountClick={handleAccClick} onCartClick={handleCartClick} />
        <main className="flex-1 pb-16 md:pb-0">
          <OrderHistorySkeleton />
        </main>
        <Footer />
        <BottomNav onBagClick={handleCartClick} />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fafbfc]">
      <Header user={user} onAccountClick={handleAccClick} onCartClick={handleCartClick} />

      <main className="flex-1 pb-16 md:pb-0">
        <div className="max-w-[1000px] mx-auto px-4 lg:px-8 py-8 lg:py-12">
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="myntra-section-title">Order History</h1>
            <p className="text-sm text-[#5a5d68] mt-1">
              View all your past orders and track their status.
            </p>
          </motion.div>

          {orders.length === 0 ? (
            <motion.div
              className="bg-white rounded-xl border border-[#eaeaec] text-center py-14 px-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.15 }}
            >
              <div className="w-16 h-16 bg-[#f5f5f6] rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-[#94969f]" />
              </div>
              <h2 className="text-lg font-bold text-[#282c3f] mb-2">
                No orders yet
              </h2>
              <p className="text-sm text-[#94969f] mb-6 max-w-sm mx-auto">
                You haven&apos;t placed any orders yet. Start shopping to see your
                order history here.
              </p>
              <button
                onClick={() => router.push("/")}
                className="myntra-btn px-8 py-3 text-sm"
              >
                Start Shopping
              </button>
            </motion.div>
          ) : (
            <motion.div
              className="space-y-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.15 }}
            >
              {orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  className="bg-white rounded-xl border border-[#eaeaec] overflow-hidden hover:shadow-card-hover transition-shadow duration-200"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.06 }}
                >
                  <div className="p-5 lg:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 pb-4 border-b border-[#eaeaec]">
                      <div>
                        <h3 className="text-base font-bold text-[#282c3f]">
                          Order #{order.orderId}
                        </h3>
                        <p className="text-sm text-[#94969f] mt-0.5">
                          {order.date && order.date.seconds ? new Date(order.date.seconds * 1000).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'Date not available'}
                        </p>
                      </div>
                      <div className="sm:text-right flex sm:flex-col items-center sm:items-end gap-2">
                        <p className="text-lg font-bold text-[#282c3f]">
                          ₹{order.total}
                        </p>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-[#e6f6ec] text-[#1a9c3e]">
                          {order.status}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-[#94969f] uppercase tracking-wide mb-4">
                        Items in this order
                      </h4>
                      <div className="space-y-4">
                        {order.items && order.items.length > 0 ? order.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex items-center gap-4">
                            <div className="w-14 h-16 bg-[#f5f5f6] rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={item.imageUrl || "/placeholder.svg"}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-[#282c3f] truncate">
                                KnitNation
                              </p>
                              <h5 className="text-sm text-[#5a5d68] truncate">
                                {item.name}
                              </h5>
                              <p className="text-xs text-[#94969f] mt-0.5">
                                Qty: {item.quantity} × ₹{item.price}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-[#282c3f]">
                                ₹{item.price * item.quantity}
                              </p>
                            </div>
                          </div>
                        )) : (
                          <p className="text-sm text-[#94969f]">No items found for this order</p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
      <BottomNav onBagClick={handleCartClick} />
    </div>
  )
}

export default hoc(OrderHistory)
