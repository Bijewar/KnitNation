"use client"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Slider from "react-slick"
import TopCategories from "../comp/top"
import Header from "../comp/Header"
import ProductCard from "../comp/ProductCard"
import { ProductCardSkeleton } from "../comp/MyntraLoader"
import Footer from "../comp/Footer"
import BottomNav from "../comp/BottomNav"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import Link from "next/link"
import "../../style/slide.css"
import { onAuthStateChange } from "../../supabase"
import { ShoppingBag, X, Minus, Plus } from "lucide-react"

import { fetchProducts } from "../../stores"
import "../../style/home.css"
import { useDispatch, useSelector } from "react-redux"
import {
  fetchProductsStart,
  fetchProductsSuccess,
  fetchProductsFailure,
  removeFromCart,
  updateQuantity,
} from "../../redux/slices"
import withReduxProvider from "../hoc"

const Home = () => {
  const [user, setUser] = useState(null)
  const [activeSlide, setActiveSlide] = useState(0)
  const [hoveredProduct, setHoveredProduct] = useState(null)
  const [displayedProducts, setDisplayedProducts] = useState(4)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isAccDropdownOpen, setIsAccDropdownOpen] = useState(false)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [hoverIndex, setHoverIndex] = useState(null)
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState("jeans")
  const dispatch = useDispatch()
  const womensProducts = useSelector((state) => state.products.women)
  const isLoading = useSelector((state) => state.products.loading)
  const cartItems = useSelector((state) => state.cart.items)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const slideshowDuration = 5000
  const imageNames = ["one", "two", "three", "four", "five"]

  useEffect(() => {
    const subscription = onAuthStateChange((currentUser) => {
      setUser(currentUser)
    })
    return () => {
      if (subscription?.unsubscribe) subscription.unsubscribe()
    }
  }, [router])

  useEffect(() => {
    const intervalId = setInterval(() => {
      setActiveSlide((prevSlide) => (prevSlide + 1) % imageNames.length)
    }, slideshowDuration)

    return () => clearInterval(intervalId)
  }, [imageNames.length])

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch(fetchProductsStart())
        const productsData = await fetchProducts()
        console.log("Fetched Products Data:", productsData)

        const filteredProductsData = {
          category: "women",
          data: (productsData.women || []).map((product) => ({
            ...product,
            createdAt: typeof product.createdAt?.toDate === 'function'
              ? product.createdAt.toDate().toISOString()
              : new Date(product.createdAt || Date.now()).toISOString(),
          })),
        }
        dispatch(fetchProductsSuccess(filteredProductsData))
      } catch (error) {
        dispatch(fetchProductsFailure(error.message))
      }
    }
    fetchData()
  }, [dispatch])
  const handleMobileMenuClick = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
    setIsAccDropdownOpen(false)
  }
  let womenJeans = []
  if (womensProducts && typeof womensProducts === "object") {
    womenJeans = womensProducts.Jeans || []
  } else if (Array.isArray(womensProducts)) {
    womenJeans = womensProducts.filter((product) => product.subcategory === "Jeans")
  }

  const handleShowMore = () => {
    router.push(`/subcategory/${selectedCategory}`)
  }

  const handleIncreaseQuantity = (id) => {
    const item = cartItems.find(item => item.id === id)
    if (item) {
      const newQuantity = Math.min(item.quantity + 1, 10)
      dispatch(updateQuantity({ id, quantity: newQuantity }))
    }
  }

  const handleDecreaseQuantity = (id) => {
    const currentItem = cartItems.find(item => item.id === id)
    if (currentItem && currentItem.quantity > 1) {
      dispatch(updateQuantity({ id, quantity: currentItem.quantity - 1 }))
    }
  }

  const handleRemoveFromCart = (id) => {
    dispatch(removeFromCart(id))
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

  const images = ["/s1.webp", "/s2.webp", "/s3.webp", "/s4.webp", "/s5.webp"]

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  }

  const sliderRef = useRef(null)

  const nextSlide = () => {
    sliderRef.current.slickNext()
  }
  const prevSlide = () => {
    sliderRef.current.slickPrev()
  }

  const imageFames = ["straight", "bootcut", "cargo"]
  const [activeSlider, setActiveSlider] = useState(0)
  const slideshowDurations = 5000

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlider((prev) => (prev + 1) % imageFames.length)
    }, slideshowDurations)

    return () => clearInterval(interval)
  }, [imageFames.length])

  const handlePayment = () => {
    if (!user) {
      router.push("/login")
      return
    }
    // Proceed with payment logic
    router.push("/comp/address")
  }

  const handleCategoryClick = (category) => {
    setSelectedCategory(category)
    console.log("Updated Selected Category:", category)
    setDisplayedProducts(4)
  }

  const handleProductHovers = (index) => {
    setHoverIndex(index)
  }

  const handleProductLeaves = () => {
    setHoverIndex(null)
  }

  const getFilteredProducts = () => {
    console.log("Women's Products from Redux:", womensProducts)
    if (!womensProducts) return []

    const subcategoryLower = selectedCategory.toLowerCase()
    const subcategoryCapitalized = selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)

    const filteredProducts = womensProducts[subcategoryLower] || womensProducts[subcategoryCapitalized] || []

    console.log("Filtered Products for", selectedCategory, filteredProducts)
    return filteredProducts
  }

  const handleBuyNow = (product) => {
    if (!product || !product.id) {
      console.error("Invalid product object passed to handleBuyNow:", product)
      return
    }

    router.push(`/product/${product.id}`)
  }

  const filteredProducts = getFilteredProducts()

  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* ================= Header (shared Myntra-style) ================= */}
      <Header user={user} onAccountClick={handleAccClick} onCartClick={handleCartClick} />

      <main className="flex-1 pb-16 md:pb-0">
        {/* ================= Hero slideshow ================= */}
        <div className="relative w-full bg-[#f5f5f6] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: "easeInOut" }}
              className="relative w-full h-[200px] sm:h-[300px] md:h-[380px] lg:h-[460px]"
            >
              <img
                className="w-full h-full object-cover"
                src={`/${imageNames[activeSlide]}.webp`}
                alt={`Slide ${activeSlide + 1}`}
              />
              <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                {imageNames.map((_, timerIndex) => (
                  <button
                    key={timerIndex}
                    aria-label={`Go to slide ${timerIndex + 1}`}
                    className="h-1 rounded-full transition-all duration-300"
                    style={{
                      width: timerIndex === activeSlide ? 24 : 8,
                      backgroundColor:
                        timerIndex === activeSlide ? "#ff3f6c" : "rgba(255,255,255,0.6)",
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8 lg:py-12">
          {/* ================= Trending carousel ================= */}
          <motion.section
            className="mb-10 lg:mb-14"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            <motion.div
              className="flex items-center justify-between mb-4"
              variants={itemVariants}
            >
              <h2 className="myntra-section-title">Trending Now</h2>
              <div className="hidden sm:flex gap-2">
                <button
                  onClick={prevSlide}
                  className="w-9 h-9 rounded-full bg-white border border-[#eaeaec] flex items-center justify-center hover:border-[#d4d5d9] hover:bg-[#f5f5f6] transition-colors"
                  aria-label="Previous"
                >
                  <svg width="8" height="12" viewBox="0 0 8 12" fill="none"><path d="M7 1L1.5 6L7 11" stroke="#282c3f" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </button>
                <button
                  onClick={nextSlide}
                  className="w-9 h-9 rounded-full bg-white border border-[#eaeaec] flex items-center justify-center hover:border-[#d4d5d9] hover:bg-[#f5f5f6] transition-colors"
                  aria-label="Next"
                >
                  <svg width="8" height="12" viewBox="0 0 8 12" fill="none"><path d="M1 1L6.5 6L1 11" stroke="#282c3f" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </button>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="relative -mx-1">
                <Slider ref={sliderRef} {...settings}>
                  {images.map((image, index) => (
                    <div key={index} className="px-1">
                      <div className="relative rounded-lg overflow-hidden aspect-[4/5] group">
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`Trending style ${index + 1}`}
                          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                        />
                      </div>
                    </div>
                  ))}
                </Slider>
              </div>
            </motion.div>
          </motion.section>

          {/* ================= Shop by Category (horizontal tiles) ================= */}
          <motion.section
            className="mb-10 lg:mb-14"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            <motion.h2
              className="myntra-section-title mb-4"
              variants={itemVariants}
            >
              Shop by Category
            </motion.h2>
            <motion.div variants={itemVariants}>
              <TopCategories />
            </motion.div>
          </motion.section>

          {/* ================= Jeans section ================= */}
          <motion.section
            className="mb-10 lg:mb-14"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            <motion.div
              className="flex items-center justify-between mb-4"
              variants={itemVariants}
            >
              <h2 className="myntra-section-title">Jeans</h2>
              <span className="text-xs text-[#94969f]">
                {Array.isArray(womenJeans) ? womenJeans.length : 0} items
              </span>
            </motion.div>

            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-3 gap-y-6 lg:gap-x-4 lg:gap-y-8"
              variants={containerVariants}
            >
              {isLoading && (!womenJeans || womenJeans.length === 0) ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))
              ) : Array.isArray(womenJeans) && womenJeans.length > 0 ? (
                womenJeans.slice(0, displayedProducts).map((product, index) => (
                  <motion.div
                    key={product.id || index}
                    variants={itemVariants}
                  >
                    <ProductCard
                      product={product}
                      onBuyNow={handleBuyNow}
                      index={index}
                    />
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-10 text-[#94969f] text-sm">
                  No products available
                </div>
              )}
            </motion.div>

            {Array.isArray(womenJeans) && displayedProducts < womenJeans.length && (
              <motion.div className="flex justify-center mt-8" variants={itemVariants}>
                <button
                  onClick={handleShowMore}
                  className="myntra-btn-outline px-10 py-3 text-sm"
                >
                  Show More
                </button>
              </motion.div>
            )}
          </motion.section>

          {/* ================= Shop by Style ================= */}
          <motion.section
            className="mb-10 lg:mb-14"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            <motion.h2
              className="myntra-section-title mb-4"
              variants={itemVariants}
            >
              Shop by Style
            </motion.h2>

            <motion.div
              className="grid grid-cols-1 sm:grid-cols-3 gap-4"
              variants={containerVariants}
            >
              {imageFames.map((imageName, index) => (
                <motion.div
                  key={index}
                  className="relative rounded-lg overflow-hidden aspect-[4/3] cursor-pointer group"
                  variants={itemVariants}
                  onClick={() => setActiveSlider(index)}
                >
                  <img
                    className="w-full h-full object-cover transition-all duration-200 group-hover:scale-[1.03]"
                    src={`/${imageName}.webp`}
                    alt={imageName}
                    style={{
                      filter: index === activeSlider ? "brightness(1)" : "brightness(0.75)",
                    }}
                  />
                  <div
                    className="absolute inset-0 transition-opacity duration-300"
                    style={{
                      backgroundColor:
                        index === activeSlider ? "rgba(0,0,0,0.05)" : "rgba(0,0,0,0.25)",
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span
                      className="text-white font-bold text-base sm:text-lg capitalize tracking-wide px-5 py-2 rounded transition-all duration-200"
                      style={{
                        backgroundColor:
                          index === activeSlider ? "#ff3f6c" : "rgba(40,44,63,0.85)",
                      }}
                    >
                      {imageName}
                    </span>
                  </div>
                  {index === activeSlider && (
                    <div className="absolute inset-0 border-2 border-[#ff3f6c] rounded-lg pointer-events-none" />
                  )}
                </motion.div>
              ))}
            </motion.div>
          </motion.section>

          {/* ================= Browse by Category ================= */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="bg-[#fafbfc] rounded-xl p-4 sm:p-6 lg:p-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="myntra-section-title mb-4 sm:mb-0">Browse by Category</h2>
              </div>
              <div className="flex gap-6 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                {["tops", "jeans", "skirts"].map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryClick(category)}
                    className={`relative pb-1.5 text-sm font-bold uppercase tracking-wide whitespace-nowrap transition-colors ${
                      selectedCategory === category
                        ? "text-[#ff3f6c]"
                        : "text-[#5a5d68] hover:text-[#282c3f]"
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                    <span
                      className={`absolute bottom-0 left-0 h-[3px] rounded-full bg-[#ff3f6c] transition-all duration-200 ${
                        selectedCategory === category ? "w-full" : "w-0"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <motion.p
              className="text-sm text-[#5a5d68] font-medium mb-5"
              variants={itemVariants}
            >
              Total Products:{" "}
              <span className="text-[#ff3f6c] font-bold">{filteredProducts.length}</span>
            </motion.p>

            {/* Filtered products grid */}
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-3 gap-y-6 lg:gap-x-4 lg:gap-y-8"
              variants={containerVariants}
            >
              {isLoading && filteredProducts.length === 0 ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))
              ) : filteredProducts.length > 0 ? (
                filteredProducts.slice(0, displayedProducts).map((product, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                  >
                    <ProductCard
                      product={product}
                      onBuyNow={handleBuyNow}
                      index={index}
                    />
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-[#94969f] text-sm">
                  No products available in this category
                </div>
              )}
            </motion.div>

            {/* Show more */}
            {displayedProducts < filteredProducts.length && (
              <motion.div className="flex justify-center mt-8" variants={itemVariants}>
                <button
                  onClick={handleShowMore}
                  className="myntra-btn-outline px-10 py-3 text-sm"
                >
                  Show More
                </button>
              </motion.div>
            )}
          </motion.section>
        </div>
      </main>

      {/* ================= Footer ================= */}
      <Footer />

      {/* ================= Mobile bottom nav ================= */}
      <BottomNav onBagClick={handleCartClick} />

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
        <div className="flex-1 overflow-y-auto">
          {cartItems.length > 0 ? (
            <div className="divide-y divide-[#eaeaec]">
              {cartItems.map((item, index) => (
                <motion.div
                  key={index}
                  className="p-4 hover:bg-[#fafbfc] transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.04 }}
                >
                  <div className="flex gap-3">
                    {/* Item image */}
                    <div className="flex-shrink-0 w-20 h-24 bg-[#f5f5f6] rounded-lg overflow-hidden">
                      <img
                        src={item.imageUrl || "/placeholder.svg"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Item details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        <p className="text-sm font-bold text-[#282c3f] truncate">
                          KnitNation
                        </p>
                        <p className="text-sm text-[#5a5d68] truncate mb-1.5">
                          {item.name}
                        </p>
                        <p className="text-sm font-bold text-[#282c3f]">
                          ₹ {item.price}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        {/* Quantity stepper */}
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
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full px-8 text-center">
              <div className="w-16 h-16 rounded-full bg-[#f5f5f6] flex items-center justify-center mb-5">
                <ShoppingBag className="w-7 h-7 text-[#94969f]" />
              </div>
              <p className="text-base font-bold text-[#282c3f] mb-1">
                Hey, it feels so light!
              </p>
              <p className="text-sm text-[#94969f] mb-6">
                There is nothing in your bag. Let&apos;s add some items.
              </p>
              <button
                onClick={handleCartClick}
                className="myntra-btn-outline px-8 py-2.5 text-sm"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>

        {/* Drawer footer with price summary + CTA */}
        {cartItems.length > 0 && (
          <motion.div
            className="border-t border-[#eaeaec] px-5 py-4 bg-white flex-shrink-0"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-[#5a5d68]">
                Total Amount ({cartItems.reduce((n, i) => n + i.quantity, 0)}{" "}
                {cartItems.reduce((n, i) => n + i.quantity, 0) === 1 ? "item" : "items"})
              </span>
              <span className="text-base font-bold text-[#282c3f]">
                ₹ {cartTotal.toLocaleString("en-IN")}
              </span>
            </div>
            <p className="text-xs text-[#94969f] mb-4">
              Convenient and secure payments via Razorpay
            </p>
            <button
              onClick={handlePayment}
              className="myntra-btn w-full py-3.5 text-sm"
            >
              Place Order
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default withReduxProvider(Home)
