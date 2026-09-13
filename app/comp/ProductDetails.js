"use client"
import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import { setAuthenticated } from "../../redux/slices"
import { useRouter } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import dynamic from "next/dynamic"
import { AnimatePresence } from "framer-motion"
import Link from "next/link"
import { motion } from "framer-motion"
import { onAuthStateChange } from "../../supabase"
import { fetchProductById, fetchUserCart, saveUserCart } from "../../stores"
import withReduxProvider from "../hoc"
import Header from "../comp/Header"
import Footer from "../comp/Footer"
import { ProductDetailsSkeleton } from "./MyntraLoader"
import { Heart, ShoppingBag, X, Minus, Plus, Star, Truck, ChevronDown, MapPin } from "lucide-react"
import "../../style/product.css"

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
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 })
  const [isDetailsOpen, setIsDetailsOpen] = useState(true)

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
    const subscription = onAuthStateChange((currentUser) => {
      setUser(currentUser)
      dispatch(setAuthenticated(!!currentUser))

      if (currentUser) {
        fetchUserCart(currentUser.id).then((items) => {
          if (items && items.length > 0) {
            dispatch(addToCart(items))
          }
        })
      } else {
        const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]")
        dispatch(addToCart(guestCart))
      }

      setLoading(false)
    })

    return () => {
      if (subscription?.unsubscribe) subscription.unsubscribe()
    }
  }, [dispatch])

  useEffect(() => {
    const fetchProduct = async () => {
      if (id) {
        try {
          setLoading(true)
          const product = await fetchProductById(id)

          if (product) {
            setProductData(product)
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

  /* Myntra-style magnify-on-hover for the main image (display only) */
  const handleImageMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPosition({ x, y })
  }
  const handleImageMouseEnter = () => setIsZoomed(true)
  const handleImageMouseLeave = () => setIsZoomed(false)

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

  const handleWishlistClick = () => {
    setIsWishlisted((prev) => !prev)
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

    if (isAuthenticated && user) {
      try {
        const currentCart = (await fetchUserCart(user.id)) || []
        const existingItemIndex = currentCart.findIndex((item) => item.id === id)
        let updatedItems = []

        if (existingItemIndex > -1) {
          updatedItems = currentCart.map((item, idx) =>
            idx === existingItemIndex ? { ...item, quantity: (item.quantity || 1) + 1 } : item
          )
        } else {
          updatedItems = [...currentCart, { id, name, price, imageUrl, quantity: 1 }]
        }

        await saveUserCart(user.id, updatedItems)
        dispatch(addToCart(updatedItems))
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
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header user={user} onAccountClick={handleAccClick} onCartClick={handleCartClick} />
        <main className="flex-1 pb-16 md:pb-0">
          <ProductDetailsSkeleton />
        </main>
        <Footer />
      </div>
    )
  if (error)
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header user={user} onAccountClick={handleAccClick} onCartClick={handleCartClick} />
        <div className="flex-1 flex flex-col items-center justify-center py-24 px-4 text-center">
          <p className="text-base font-bold text-[#282c3f] mb-2">Something went wrong</p>
          <p className="text-sm text-[#94969f]">{error}</p>
          <Link href="/home" className="myntra-btn-outline px-8 py-2.5 text-sm mt-6">
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  if (!productData)
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header user={user} onAccountClick={handleAccClick} onCartClick={handleCartClick} />
        <div className="flex-1 flex items-center justify-center py-24 text-[#94969f] text-sm">
          No product data available.
        </div>
      </div>
    )

  const { name, price, description, imageUrls } = productData

  const mainImage = selectedImage || (imageUrls && imageUrls[0]) || "/placeholder.svg"

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* ================= Header (shared Myntra-style) ================= */}
      <Header user={user} onAccountClick={handleAccClick} onCartClick={handleCartClick} />

      <main className="flex-1 pb-20 md:pb-0">
        <div className="max-w-[1100px] mx-auto px-4 lg:px-8 py-6 lg:py-10 flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* ================= Gallery (left) ================= */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col-reverse md:flex-row gap-3 md:gap-4">
              {/* Thumbnails */}
              {imageUrls && imageUrls.length > 0 && (
                <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible no-scrollbar md:w-[72px] flex-shrink-0">
                  {imageUrls.map((imageUrl, index) => (
                    <div
                      key={index}
                      onClick={() => handleImageClick(imageUrl)}
                      className={`pdp-thumb flex-shrink-0 w-[58px] md:w-full ${
                        mainImage === imageUrl ? "selected" : ""
                      }`}
                      style={{
                        backgroundImage: `url(${imageUrl})`,
                      }}
                      role="button"
                      aria-label={`View image ${index + 1}`}
                    />
                  ))}
                </div>
              )}

              {/* Main image with magnify-on-hover */}
              <div className="flex-1 min-w-0">
                <motion.div
                  key={mainImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`pdp-main-image ${isZoomed ? "zoomed" : ""}`}
                  style={{
                    backgroundImage: `url(${mainImage})`,
                    backgroundPosition: isZoomed
                      ? `${zoomPosition.x}% ${zoomPosition.y}%`
                      : "center",
                  }}
                  onMouseMove={handleImageMouseMove}
                  onMouseEnter={handleImageMouseEnter}
                  onMouseLeave={handleImageMouseLeave}
                  role="img"
                  aria-label={name || "Product image"}
                />
              </div>
            </div>
          </div>

          {/* ================= Details (right) ================= */}
          <div className="w-full lg:w-[445px] flex-shrink-0">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Brand + title */}
              <h1 className="text-xl font-bold text-[#282c3f] tracking-wide">
                KnitNation
              </h1>
              <p className="text-base text-[#5a5d68] mt-0.5 mb-3">{name}</p>

              {/* Rating row (kept from the original page - see change report
                  re: hardcoded rating) */}
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1 bg-[#1a9c3e] text-white text-xs font-bold rounded px-1.5 py-1">
                  4.5
                  <Star className="w-3 h-3 fill-white text-white" />
                </span>
                <span className="text-sm text-[#94969f]">| 128 ratings</span>
              </div>

              {/* Price - MRP & discount render only when present in data */}
              <div className="flex items-baseline gap-2.5 mb-1">
                <span className="text-2xl font-bold text-[#282c3f]">₹{price}</span>
                {productData.mrp && Number(productData.mrp) > Number(price) && (
                  <span className="text-sm text-[#94969f] line-through">
                    ₹{productData.mrp}
                  </span>
                )}
                {productData.mrp && Number(productData.mrp) > Number(price) && (
                  <span className="text-sm font-bold text-[#f26b23]">
                    {Math.round(
                      ((Number(productData.mrp) - Number(price)) / Number(productData.mrp)) * 100
                    )}% OFF
                  </span>
                )}
              </div>
              <p className="text-xs text-[#94969f] mb-6">inclusive of all taxes</p>

              {/* Size selector + size chart toggle (existing dispatch) */}
              <div className="border-y border-[#eaeaec] py-5 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-[#282c3f]">Select Size</p>
                  <button
                    onClick={() => dispatch(toggleSizeChartModal())}
                    className="text-sm font-bold text-[#ff3f6c] hover:underline underline-offset-2"
                  >
                    View Size Chart
                  </button>
                </div>
                <SizeSelection />
              </div>

              {/* CTA buttons */}
              <div className="flex gap-3 mb-8">
                <button
                  onClick={handleAddToCart}
                  className="myntra-btn flex-1 py-4 text-sm"
                >
                  Add to Bag
                </button>
                <button
                  onClick={handleWishlistClick}
                  className={`myntra-btn-outline flex items-center justify-center gap-2 px-6 py-4 text-sm w-[145px] flex-shrink-0 ${
                    isWishlisted ? "bg-[#fff0f4] border-[#ff3f6c] text-[#ff3f6c]" : ""
                  }`}
                  aria-pressed={isWishlisted}
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isWishlisted ? "fill-[#ff3f6c] text-[#ff3f6c]" : ""
                    }`}
                  />
                  {isWishlisted ? "Wishlisted" : "Wishlist"}
                </button>
              </div>

              {/* Delivery options (existing pincode check flow) */}
              <div className="mb-8">
                <div className="flex items-center gap-1.5 mb-3">
                  <Truck className="w-4 h-4 text-[#282c3f]" />
                  <p className="text-sm font-bold text-[#282c3f]">
                    Delivery Options
                  </p>
                </div>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Enter a PIN code"
                    value={pincode}
                    onChange={handlePincodeChange}
                    className="myntra-input flex-1"
                    maxLength={6}
                    aria-label="PIN code"
                  />
                  <button
                    onClick={checkAvailability}
                    className="px-6 py-2.5 rounded bg-[#ff3f6c] hover:bg-[#e6345e] text-white text-sm font-bold uppercase tracking-wide transition-colors"
                  >
                    Check
                  </button>
                </div>
                {city ? (
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1.5 text-[#282c3f]">
                      <MapPin className="w-4 h-4 text-[#1a9c3e]" />
                      {city}
                    </span>
                    {estimatedDeliveryDate && (
                      <span className="text-[#1a9c3e] font-medium">
                        Delivery by {estimatedDeliveryDate}
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-[#94969f]">
                    Please enter a PIN code to check delivery date.
                  </p>
                )}
              </div>

              {/* Product details accordion */}
              <div>
                <button
                  className="pdp-accordion-trigger"
                  onClick={() => setIsDetailsOpen((open) => !open)}
                  aria-expanded={isDetailsOpen}
                >
                  Product Details
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isDetailsOpen ? "" : "-rotate-90"
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isDetailsOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <div className="pdp-accordion-content">
                        {description || "No description available for this product."}
                        {productData.subcategory && (
                          <p className="mt-3 text-xs text-[#94969f]">
                            Category: {productData.collection === "mens" ? "Men" : "Women"}{" "}
                            / {productData.subcategory}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* ================= Mobile sticky Add to Bag bar ================= */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#eaeaec] md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex flex-col flex-shrink-0">
            <span className="text-base font-bold text-[#282c3f]">₹{price}</span>
            <span className="text-[10px] text-[#1a9c3e] font-bold uppercase">
              Free Delivery
            </span>
          </div>
          <button onClick={handleAddToCart} className="myntra-btn flex-1 py-3 text-sm">
            Add to Bag
          </button>
        </div>
      </div>

      {/* ================= Cart overlay ================= */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={handleCartClick}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      {/* ================= Cart drawer (Myntra-style bag) ================= */}
      {!showAddressForm && (
        <motion.div
          className="fixed right-0 top-0 h-screen w-full sm:w-[420px] bg-white shadow-[0_0_40px_rgba(0,0,0,0.18)] z-50 flex flex-col overflow-hidden"
          initial={{ x: "100%" }}
          animate={{ x: isCartOpen ? 0 : "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          aria-label="Shopping bag"
        >
          {/* Drawer header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#eaeaec] flex-shrink-0">
            <div className="flex items-baseline gap-2">
              <h2 className="text-base font-bold text-[#282c3f] uppercase tracking-wide">
                Shopping Bag
              </h2>
              <span className="text-sm text-[#94969f]">
                {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
              </span>
            </div>
            <button
              onClick={handleCartClick}
              className="p-2 -mr-2 text-[#5a5d68] hover:text-[#282c3f] transition-colors"
              aria-label="Close bag"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer items */}
          {cartItems.length > 0 ? (
            <>
              <div className="flex-1 overflow-y-auto">
                <div className="divide-y divide-[#eaeaec]">
                  {cartItems.map((item, index) => (
                    <div key={index} className="p-4 hover:bg-[#fafbfc] transition-colors">
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-20 h-24 bg-[#f5f5f6] rounded-lg overflow-hidden">
                          <img
                            src={item.imageUrl || "/placeholder.svg"}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                          <div>
                            <p className="text-sm font-bold text-[#282c3f] truncate">
                              KnitNation
                            </p>
                            <p className="text-sm text-[#5a5d68] truncate mb-1.5">
                              {item.name}
                            </p>
                            <p className="text-sm font-bold text-[#282c3f]">
                              ₹{item.price}
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center border border-[#eaeaec] rounded">
                              <button
                                onClick={() => handleDecreaseQuantity(item.id)}
                                className="w-7 h-7 flex items-center justify-center text-[#5a5d68] hover:bg-[#f5f5f6] transition-colors disabled:opacity-40"
                                aria-label="Decrease quantity"
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-8 text-center text-sm font-bold text-[#282c3f]">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleIncreaseQuantity(item.id)}
                                className="w-7 h-7 flex items-center justify-center text-[#5a5d68] hover:bg-[#f5f5f6] transition-colors disabled:opacity-40"
                                aria-label="Increase quantity"
                                disabled={item.quantity >= 10}
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <button
                              onClick={() => handleRemoveFromCart(item.id)}
                              className="text-sm font-bold text-[#5a5d68] hover:text-[#ff3f6c] transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Drawer footer with price summary + CTA */}
              <div className="border-t border-[#eaeaec] px-5 py-4 bg-white flex-shrink-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-[#5a5d68]">
                    Total Amount ({cartItems.reduce((n, i) => n + i.quantity, 0)}{" "}
                    {cartItems.reduce((n, i) => n + i.quantity, 0) === 1 ? "item" : "items"})
                  </span>
                  <span className="text-base font-bold text-[#282c3f]">
                    ₹{cartTotal.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-[#94969f] mb-4">
                  Convenient and secure payments via Razorpay
                </p>
                <button
                  onClick={handleProceedToPay}
                  disabled={isLoading}
                  className="myntra-btn w-full py-3.5 text-sm flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <div className="myntra-spinner-sm mr-2" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    "Place Order"
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
              <div className="w-16 h-16 rounded-full bg-[#f5f5f6] flex items-center justify-center mb-5">
                <ShoppingBag className="w-7 h-7 text-[#94969f]" />
              </div>
              <p className="text-base font-bold text-[#282c3f] mb-1">
                Hey, it feels so light!
              </p>
              <p className="text-sm text-[#94969f] mb-6">
                There is nothing in your bag. Let&apos;s add some items.
              </p>
              <button onClick={handleCartClick} className="myntra-btn-outline px-8 py-2.5 text-sm">
                Continue Shopping
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* ================= Size chart modal (existing component) ================= */}
      {isSizeChartModalOpen && <SizeChartModal onClose={() => dispatch(toggleSizeChartModal())} />}
    </div>
  )
}

export default withReduxProvider(ProductDetails)
