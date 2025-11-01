"use client"
import { useState, useEffect } from "react"
import { getDoc, doc, setDoc, arrayUnion, updateDoc } from "firebase/firestore"
import { toast } from "react-toastify"
import { setAuthenticated } from "../../redux/slices"
import { useRouter } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import dynamic from "next/dynamic"
import {  AnimatePresence } from "framer-motion"
import Link from "next/link"
import { motion } from "framer-motion"
import { db, auth } from "../../firebase"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import withReduxProvider from "../hoc"
import { Menu, X, Search } from "lucide-react"

import SizeSelection from "../comp/size"
import SizeChartModal from "../comp/chart"
import {
  setSelectedImage,
  toggleSizeChartModal,
  setPincode,
  setCity,
  setEstimatedDeliveryDate,
  addToCart,
  clearSelectedImage,
  updateQuantity,
  removeFromCart,
} from "../../redux/slices"

const AddressPage = dynamic(() => import("@/app/comp/address/page"), { ssr: false })

const ProductDetails = ({ id }) => {
  const router = useRouter()
  const dispatch = useDispatch()
  const isAuthenticated = useSelector((state) => state.cart.isAuthenticated)

  const [user, setUser] = useState(null)
  const [productData, setProductData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pincode, setPincodeLocal] = useState("")
  const [scrollPosition, setScrollPosition] = useState(0)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const [isAccDropdownOpen, setIsAccDropdownOpen] = useState(false)
  const [city, setCityLocal] = useState("")
  const [estimatedDeliveryDate, setEstimatedDeliveryDateLocal] = useState("")
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const selectedImage = useSelector((state) => state.products.selectedImage)
  const isSizeChartModalOpen = useSelector((state) => state.products.isSizeChartModalOpen)
  const cartItems = useSelector((state) => state.cart.items)
  const [promoCode, setPromoCode] = useState("")
  const [discount, setDiscount] = useState(0)
  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  const [showAddressForm, setShowAddressForm] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])



  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      dispatch(setAuthenticated(!!currentUser))

      if (currentUser) {
        const fetchCartFromDatabase = async () => {
          try {
            const userCartRef = doc(db, "userCarts", currentUser.uid)
            const cartDoc = await getDoc(userCartRef)

            if (cartDoc.exists()) {
              const cartData = cartDoc.data()
              dispatch(addToCart(cartData.items))
            }
          } catch (error) {
            console.error("Error fetching cart from database:", error)
          }
        }

        fetchCartFromDatabase()
      } else {
        const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]")
        dispatch(addToCart(guestCart))
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [dispatch])

  useEffect(() => {
    const fetchProduct = async () => {
      if (id) {
        try {
          setLoading(true)
          let productDocRef = doc(db, "mens", id)
          let productSnapshot = await getDoc(productDocRef)

          if (!productSnapshot.exists()) {
            productDocRef = doc(db, "womens", id)
            productSnapshot = await getDoc(productDocRef)
          }

          if (productSnapshot.exists()) {
            setProductData({
              id: productSnapshot.id,
              ...productSnapshot.data(),
              collection: productSnapshot.ref.parent.id,
            })
          } else {
            setError(`Product with ID ${id} not found.`)
          }
        } catch (err) {
          setError(`Error fetching product data: ${err.message}`)
        } finally {
          setLoading(false)
        }
      }
    }

    if (id) {
      fetchProduct()
    }
  }, [id])

  useEffect(() => {
    return () => {
      dispatch(clearSelectedImage())
    }
  }, [dispatch])
  const handleMobileMenuClick = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
    setIsAccDropdownOpen(false)
  }
  const handleImageClick = (imageUrl) => {
    dispatch(setSelectedImage(imageUrl))
  }

  const handlePincodeChange = (e) => {
    setPincodeLocal(e.target.value)
  }

  const handleAccClick = () => {
    if (user) {
      setIsAccDropdownOpen(!isAccDropdownOpen)
    } else {
      router.push("/login")
    }
  }

  const handleCartClick = () => {
    if (!isCartOpen) {
      setScrollPosition(window.scrollY)
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
      window.scrollTo(0, scrollPosition)
    }
    setIsCartOpen(!isCartOpen)
  }

  const checkAvailability = async () => {
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`)
      const data = await response.json()

      if (data && data[0].Status === "Success" && data[0].PostOffice.length > 0) {
        const estimatedDate = calculateEstimatedDeliveryDate()
        setCityLocal(data[0].PostOffice[0].District)
        setEstimatedDeliveryDateLocal(estimatedDate)
        dispatch(setCity(data[0].PostOffice[0].District))
        dispatch(setEstimatedDeliveryDate(estimatedDate))
        dispatch(setPincode(pincode))
      } else {
        setCityLocal("")
        setEstimatedDeliveryDateLocal("")
        dispatch(setCity(""))
        dispatch(setEstimatedDeliveryDate(""))
      }
    } catch (error) {
      console.error("Error fetching availability:", error)
    }
  }

  const calculateEstimatedDeliveryDate = () => {
    const currentDate = new Date()
    const estimatedDate = new Date(currentDate.getTime() + 5 * 24 * 60 * 60 * 1000)
    return estimatedDate.toDateString()
  }

  const handleAddToCart = async () => {
    if (!productData || !productData.price) {
      toast.error("Error adding to cart. Please try again later.")
      return
    }

    const { id, price, name, imageUrls } = productData
    const imageUrl = selectedImage || (imageUrls && imageUrls[0]) || ""

    if (isAuthenticated) {
      try {
        if (!user) {
          await new Promise((resolve) => {
            const unsubscribe = onAuthStateChanged(getAuth(), (currentUser) => {
              if (currentUser) {
                setUser(currentUser)
                resolve()
              }
            })
            return () => unsubscribe()
          })
        }

        const userCartRef = doc(db, "userCarts", user.uid)
        const cartDoc = await getDoc(userCartRef)

        if (!cartDoc.exists()) {
          await setDoc(userCartRef, { items: [{ id, name, price, imageUrl, quantity: 1 }] })
          dispatch(addToCart([{ id, name, price, imageUrl, quantity: 1 }]))
        } else {
          const existingItem = cartDoc.data().items.find((item) => item.id === id)

          if (existingItem) {
            const updatedItems = cartDoc
              .data()
              .items.map((item) => (item.id === id ? { ...item, quantity: item.quantity + 1 } : item))
            await updateDoc(userCartRef, { items: updatedItems })
            dispatch(addToCart(updatedItems))
          } else {
            await updateDoc(userCartRef, { items: arrayUnion({ id, name, price, imageUrl, quantity: 1 }) })
            dispatch(addToCart([...cartDoc.data().items, { id, name, price, imageUrl, quantity: 1 }]))
          }
        }

        toast.success("Product added to cart!")
      } catch (error) {
        console.error("Error adding to database cart:", error)
        toast.error("Error adding to cart. Please try again later.")
      }
    } else {
      let guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]")
      const existingItem = guestCart.find((item) => item.id === id)

      if (existingItem) {
        const updatedQuantity = existingItem.quantity + 1
        dispatch(updateQuantity({ id: existingItem.id, quantity: updatedQuantity }))
        guestCart = guestCart.map((item) => (item.id === id ? { ...item, quantity: updatedQuantity } : item))
        localStorage.setItem("guestCart", JSON.stringify(guestCart))
      } else {
        const newItem = {
          id,
          name,
          price: Number.parseFloat(price),
          imageUrl,
          quantity: 1,
        }
        dispatch(addToCart(newItem))
        guestCart.push(newItem)
        localStorage.setItem("guestCart", JSON.stringify(guestCart))
      }

      toast.success("Product added to cart!")
    }

    setIsCartOpen(true)
  }

  const handleIncreaseQuantity = async (id) => {
    const item = cartItems.find((item) => item.id === id)
    if (item) {
      const newQuantity = Math.min(item.quantity + 1, 10)
      dispatch(updateQuantity({ id, quantity: newQuantity }))

      if (isAuthenticated && user) {
        try {
          const userCartRef = doc(db, "userCarts", user.uid)
          const cartDoc = await getDoc(userCartRef)

          if (cartDoc.exists()) {
            const updatedItems = cartDoc
              .data()
              .items.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item))
            await updateDoc(userCartRef, { items: updatedItems })
          }
        } catch (error) {
          console.error("Error updating quantity in database:", error)
          toast.error("Error updating cart. Please try again later.")
        }
      }
    }
  }

  const handleDecreaseQuantity = async (id) => {
    const item = cartItems.find((item) => item.id === id)
    if (item) {
      const newQuantity = Math.max(item.quantity - 1, 1)
      dispatch(updateQuantity({ id, quantity: newQuantity }))

      if (isAuthenticated && user) {
        try {
          const userCartRef = doc(db, "userCarts", user.uid)
          const cartDoc = await getDoc(userCartRef)

          if (cartDoc.exists()) {
            const updatedItems = cartDoc
              .data()
              .items.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item))
            await updateDoc(userCartRef, { items: updatedItems })
          }
        } catch (error) {
          console.error("Error updating quantity in database:", error)
          toast.error("Error updating cart. Please try again later.")
        }
      }
    }
  }

  const handleRemoveFromCart = async (id) => {
    dispatch(removeFromCart(id))

    if (isAuthenticated && user) {
      try {
        const userCartRef = doc(db, "userCarts", user.uid)
        const cartDoc = await getDoc(userCartRef)

        if (cartDoc.exists()) {
          const updatedItems = cartDoc.data().items.filter((item) => item.id !== id)
          await updateDoc(userCartRef, { items: updatedItems })
        }
      } catch (error) {
        console.error("Error removing from database cart:", error)
        toast.error("Error updating cart. Please try again later.")
      }
    }
  }

  const handleProceedToPay = async () => {
    if (!isAuthenticated) {
      toast.info("Please log in to proceed to checkout.")
      router.push("/login")
      localStorage.setItem("guestCart", JSON.stringify(cartItems))
      return
    }

    if (loading) {
      toast.info("Please wait while we load your cart data.")
      return
    }

    localStorage.setItem("cartItems", JSON.stringify(cartItems))
    localStorage.setItem("cartTotal", (cartTotal - discount).toFixed(2))
    router.push("/comp/address")
  }

  if (loading)
    return <div style={{ padding: "40px", textAlign: "center", fontSize: "18px", color: "#666" }}>Loading...</div>
  if (error) return <div style={{ padding: "40px", textAlign: "center", color: "#d32f2f" }}>Error: {error}</div>
  if (!productData)
    return <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>No product data available.</div>

  const { name, price, description, imageUrls } = productData

  return (
    <>
    <motion.nav
      className="sticky top-0 z-50 bg-white border-b border-neutral-200 shadow-lg backdrop-blur-sm bg-opacity-95"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 md:h-20">
          {/* Logo - Centered on mobile, left on desktop */}
          <motion.div
            className="flex-1 flex justify-center md:flex-none md:justify-start"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <Link href="/" className="inline-flex items-center">
              <img className="h-6 sm:h-8 md:h-10 w-auto" src="/logo.png" alt="Logo" />
            </Link>
          </motion.div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8 flex-1 justify-center">
            <Link
              href="/"
              className="text-sm font-semibold text-neutral-900 hover:text-emerald-600 transition-all duration-300 relative group"
            >
              Womens
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              href="/men"
              className="text-sm font-semibold text-neutral-900 hover:text-emerald-600 transition-all duration-300 relative group"
            >
              Mens
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex items-center bg-neutral-100 rounded-full px-4 py-2 hover:bg-neutral-200 transition-colors duration-300 flex-1 max-w-xs">
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent text-sm text-neutral-900 placeholder-neutral-500 outline-none w-full"
            />
            <Search className="w-4 h-4 text-neutral-400 ml-2 flex-shrink-0" />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-6 flex-1 justify-end">
            {/* Mobile Search Icon */}
            <motion.button
              className="md:hidden p-1.5 sm:p-2 hover:bg-neutral-100 rounded-full transition-colors flex-shrink-0"
              aria-label="Search"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-900" />
            </motion.button>

            {/* Account Button */}
            <motion.button
              onClick={handleAccClick}
              className="p-1.5 sm:p-2 hover:bg-neutral-100 rounded-full transition-colors flex-shrink-0"
              aria-label="Account"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <img className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" src="/acc.png" alt="Account" />
            </motion.button>

            {/* Account Dropdown */}
            <AnimatePresence>
              {isAccDropdownOpen && user && (
                <motion.div
                  className="absolute top-14 sm:top-16 md:top-20 right-3 sm:right-4 md:right-6 bg-white border border-neutral-200 rounded-lg shadow-xl overflow-hidden z-40 min-w-max"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    href="/order-history"
                    className="block px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-neutral-900 hover:bg-emerald-50 transition-colors"
                  >
                    Order History
                  </Link>
                  <button
                    onClick={() => {
                      setIsAccDropdownOpen(false)
                    }}
                    className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-neutral-900 hover:bg-emerald-50 transition-colors border-t border-neutral-200"
                  >
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Cart Button */}
            <motion.button
              onClick={handleCartClick}
              className="p-1.5 sm:p-2 hover:bg-neutral-100 rounded-full transition-colors relative flex-shrink-0"
              aria-label="Shopping cart"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <img className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" src="/cart.png" alt="Cart" />
              <AnimatePresence>
                {cartItems.length > 0 && (
                  <motion.span
                    className="absolute -top-1 -right-1 bg-emerald-600 text-white text-xs font-bold rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    {cartItems.length > 99 ? "99+" : cartItems.length}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Mobile Menu Toggle */}
            <motion.button
              onClick={handleMobileMenuClick}
              className="md:hidden p-1.5 sm:p-2 hover:bg-neutral-100 rounded-full transition-colors flex-shrink-0"
              aria-label="Toggle menu"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {isMobileMenuOpen ? (
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-900" />
              ) : (
                <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-900" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="md:hidden border-t border-neutral-200 bg-white"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex flex-col divide-y divide-neutral-100 py-2">
                <Link
                  href="/"
                  className="px-4 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-50 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Womens
                </Link>
                <Link
                  href="/men"
                  className="px-4 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-50 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Mens
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
      

      <main
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: isMobile ? "24px" : "48px",
          padding: isMobile ? "20px 16px" : "40px 60px",
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <motion.div
            key={selectedImage || (imageUrls && imageUrls[0])}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{
              width: "100%",
              aspectRatio: "1",
              backgroundColor: "#f5f5f5",
              borderRadius: "12px",
              overflow: "hidden",
              backgroundImage: `url(${selectedImage || (imageUrls && imageUrls[0])})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          {imageUrls && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "repeat(4, 1fr)" : "repeat(4, 1fr)",
                gap: "12px",
              }}
            >
              {imageUrls.map((imageUrl, index) => (
                <motion.div
                  key={index}
                  onClick={() => handleImageClick(imageUrl)}
                  whileHover={{ scale: 1.05 }}
                  style={{
                    aspectRatio: "1",
                    backgroundColor: "#f5f5f5",
                    borderRadius: "8px",
                    cursor: "pointer",
                    border: selectedImage === imageUrl ? "2px solid #000" : "1px solid #e0e0e0",
                    backgroundImage: `url(${imageUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    transition: "all 0.2s",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div>
            <h1
              style={{
                fontSize: isMobile ? "24px" : "32px",
                fontWeight: "700",
                margin: "0 0 12px 0",
                lineHeight: "1.2",
                color: "#000",
              }}
            >
              {name}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <div style={{ display: "flex", gap: "4px" }}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={{ fontSize: "18px", color: "#ffc107" }}>
                    ★
                  </span>
                ))}
              </div>
              <span style={{ fontSize: "14px", color: "#666" }}>(128 reviews)</span>
            </div>
            {price && (
              <p style={{ fontSize: isMobile ? "28px" : "36px", fontWeight: "700", color: "#000", margin: "0" }}>
                ₹{price}
              </p>
            )}
          </div>

          <div style={{ borderTop: "1px solid #e0e0e0", borderBottom: "1px solid #e0e0e0", paddingY: "16px" }}>
            <SizeSelection />
          </div>

          <div
            style={{
              backgroundColor: "#f9f9f9",
              padding: "16px",
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              transition: "all 0.2s",
            }}
            onClick={() => dispatch(toggleSizeChartModal())}
          >
            <img src="/download.png" alt="size chart" style={{ height: "20px" }} />
            <span style={{ fontSize: "14px", fontWeight: "500", color: "#000" }}>View Size Chart</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <label style={{ fontSize: "14px", fontWeight: "600", color: "#000" }}>Check Delivery Availability</label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                placeholder="Enter PIN code"
                value={pincode}
                onChange={handlePincodeChange}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  border: "1px solid #e0e0e0",
                  borderRadius: "6px",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
              <button
                onClick={checkAvailability}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#000",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  transition: "all 0.2s",
                }}
              >
                Check
              </button>
            </div>
            {city && (
              <div style={{ display: "flex", gap: "12px", fontSize: "14px", color: "#666" }}>
                <span>🚚 {city}</span>
                {estimatedDeliveryDate && <span>Delivery by {estimatedDeliveryDate}</span>}
              </div>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            style={{
              padding: isMobile ? "14px 24px" : "16px 32px",
              backgroundColor: "#000",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontSize: isMobile ? "16px" : "16px",
              fontWeight: "700",
              cursor: "pointer",
              transition: "all 0.3s",
              width: "100%",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#1a1a1a")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#000")}
          >
            Add to Cart
          </button>

          {description && (
            <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid #e0e0e0" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px", color: "#000" }}>Description</h3>
              <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#666" }}>{description}</p>
            </div>
          )}
        </div>
      </main>

      {!showAddressForm && (
        <motion.div
          initial={{ x: isCartOpen ? "0" : "100%" }}
          animate={{ x: isCartOpen ? "0" : "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          style={{
            position: "fixed",
            right: 0,
            top: 0,
            width: isMobile ? "100%" : "400px",
            height: "100vh",
            backgroundColor: "#fff",
            boxShadow: "-4px 0 16px rgba(0,0,0,0.1)",
            zIndex: 999,
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "20px",
              borderBottom: "1px solid #e0e0e0",
            }}
          >
            <h2 style={{ fontSize: "20px", fontWeight: "700", margin: 0, color: "#000" }}>Your Cart</h2>
            <button
              onClick={handleCartClick}
              style={{
                backgroundColor: "transparent",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                color: "#666",
              }}
            >
              ✕
            </button>
          </div>

          {cartItems.length > 0 ? (
            <>
              <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
                {cartItems.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      gap: "12px",
                      paddingBottom: "16px",
                      marginBottom: "16px",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    <img
                      src={item.imageUrl || "/placeholder.svg"}
                      alt={item.name}
                      style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "6px",
                        objectFit: "cover",
                        backgroundColor: "#f5f5f5",
                      }}
                    />
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div>
                        <p style={{ fontSize: "14px", fontWeight: "600", margin: "0 0 4px 0", color: "#000" }}>
                          {item.name}
                        </p>
                        <p style={{ fontSize: "14px", fontWeight: "700", margin: "0", color: "#000" }}>₹{item.price}</p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <button
                          onClick={() => handleDecreaseQuantity(item.id)}
                          style={{
                            width: "28px",
                            height: "28px",
                            border: "1px solid #e0e0e0",
                            borderRadius: "4px",
                            backgroundColor: "#fff",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: "600",
                          }}
                        >
                          −
                        </button>
                        <span style={{ fontSize: "14px", fontWeight: "600", minWidth: "20px", textAlign: "center" }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleIncreaseQuantity(item.id)}
                          style={{
                            width: "28px",
                            height: "28px",
                            border: "1px solid #e0e0e0",
                            borderRadius: "4px",
                            backgroundColor: "#fff",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: "600",
                          }}
                        >
                          +
                        </button>
                        <button
                          onClick={() => handleRemoveFromCart(item.id)}
                          style={{
                            marginLeft: "auto",
                            backgroundColor: "transparent",
                            border: "none",
                            color: "#d32f2f",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  borderTop: "1px solid #e0e0e0",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "16px", fontWeight: "700" }}>
                  <span>Total:</span>
                  <span>₹{cartTotal.toFixed(2)}</span>
                </div>
                <button
                  onClick={handleProceedToPay}
                  disabled={isLoading}
                  style={{
                    padding: "14px",
                    backgroundColor: "#000",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "16px",
                    fontWeight: "700",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    opacity: isLoading ? 0.6 : 1,
                  }}
                  onMouseEnter={(e) => !isLoading && (e.target.style.backgroundColor = "#1a1a1a")}
                  onMouseLeave={(e) => !isLoading && (e.target.style.backgroundColor = "#000")}
                >
                  {isLoading ? "Processing..." : "Proceed to Checkout"}
                </button>
              </div>
            </>
          ) : (
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#999",
                fontSize: "16px",
              }}
            >
              Your cart is empty
            </div>
          )}
        </motion.div>
      )}

      {isSizeChartModalOpen && <SizeChartModal onClose={() => dispatch(toggleSizeChartModal())} />}
    </>
  )
}

export default withReduxProvider(ProductDetails)
