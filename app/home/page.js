"use client"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Slider from "react-slick"
import TopCategories from "../comp/top"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import Link from "next/link"
import "../../style/slide.css"
import { auth } from "../../firebase"
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
  const cartItems = useSelector((state) => state.cart.items)

  const slideshowDuration = 5000
  const imageNames = ["one", "two", "three", "four", "five"]

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser)
      } else {
        // Allow access to /home without login, but redirect to login for purchases
        setUser(null)
      }
    })
    return () => unsubscribe()
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
          data: productsData.women.map((product) => ({
            ...product,
            createdAt: product.createdAt.toDate().toISOString(),
          })),
        }
        dispatch(fetchProductsSuccess(filteredProductsData))
      } catch (error) {
        dispatch(fetchProductsFailure(error.message))
      }
    }
    fetchData()
  }, [dispatch])

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  }

  return (
    <>
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
              <div className="hidden md:flex items-center bg-neutral-100 rounded-full px-3 sm:px-4 py-2 flex-1 max-w-xs hover:bg-neutral-200 transition-colors duration-300">
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent text-xs sm:text-sm text-neutral-900 placeholder-neutral-500 outline-none w-full"
                />
                <img className="w-3 h-3 sm:w-4 sm:h-4 text-neutral-400" src="/search-line.png" alt="Search" />
              </div>

              <motion.button
                onClick={handleAccClick}
                className="p-1.5 sm:p-2 hover:bg-neutral-100 rounded-full transition-colors relative flex-shrink-0"
                aria-label="Account"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <img className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" src="/acc.png" alt="Account" />
              </motion.button>

              <AnimatePresence>
                {isAccDropdownOpen && user && (
                  <motion.div
                    className="absolute top-12 sm:top-14 md:top-20 right-2 sm:right-4 bg-white border border-neutral-200 rounded-lg shadow-xl overflow-hidden z-40 min-w-max"
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
                      onClick={() => auth.signOut()}
                      className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-neutral-900 hover:bg-emerald-50 transition-colors border-t border-neutral-200"
                    >
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

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
                      className="absolute top-0 right-0 bg-emerald-600 text-white text-xs font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      {cartItems.length}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      <main className="bg-gradient-to-b from-neutral-50 to-white min-h-screen">
        {/* Hero Slideshow */}
        <div className="relative w-full bg-white overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.7, ease: [0.43, 0.13, 0.23, 0.96] }}
              className="relative w-full aspect-video sm:aspect-video md:aspect-auto md:h-80 lg:h-[500px]"
            >
              <img 
                className="w-full h-full object-cover" 
                src={`/${imageNames[activeSlide]}.webp`} 
                alt={`Slide ${activeSlide + 1}`} 
              />
              <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1 sm:gap-2">
                {imageNames.map((_, timerIndex) => (
                  <motion.div
                    key={timerIndex}
                    className={`h-0.5 sm:h-1 rounded-full ${
                      timerIndex === activeSlide ? "bg-emerald-600" : "bg-neutral-300"
                    }`}
                    initial={false}
                    animate={{ 
                      width: timerIndex === activeSlide ? 32 : 6,
                      opacity: timerIndex === activeSlide ? 1 : 0.5
                    }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
          {/* Jeans Section */}
          <motion.section
            className="mb-12 sm:mb-16"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.h2
              className="text-xl sm:text-2xl md:text-3xl font-bold text-neutral-900 mb-6 sm:mb-8"
              variants={itemVariants}
            >
              Jeans
            </motion.h2>

            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-8"
              variants={containerVariants}
            >
              {Array.isArray(womenJeans) && womenJeans.length > 0 ? (
                womenJeans.slice(0, displayedProducts).map((product, index) => (
                  <motion.div
                    key={product.id || index}
                    className="group"
                    onMouseEnter={() => setHoveredProduct(`jeans-${index}`)}
                    onMouseLeave={() => setHoveredProduct(null)}
                    variants={itemVariants}
                    whileHover={{ y: -8 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="relative bg-neutral-100 rounded-xl overflow-hidden mb-3 sm:mb-4 aspect-square shadow-md hover:shadow-xl transition-shadow duration-300">
                      {product.imageUrls && product.imageUrls.length > 0 ? (
                        <>
                          <motion.img
                            className="w-full h-full object-cover absolute inset-0"
                            src={product.imageUrls[0] || "/placeholder.svg"}
                            alt={product.name}
                            initial={false}
                            animate={{ 
                              opacity: hoveredProduct === `jeans-${index}` ? 0 : 1,
                              scale: hoveredProduct === `jeans-${index}` ? 1.05 : 1
                            }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                          />
                          <motion.img
                            className="w-full h-full object-cover absolute inset-0"
                            src={product.imageUrls[1] || product.imageUrls[0]}
                            alt={product.name}
                            initial={false}
                            animate={{ 
                              opacity: hoveredProduct === `jeans-${index}` ? 1 : 0,
                              scale: hoveredProduct === `jeans-${index}` ? 1 : 1.05
                            }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                          />
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-400">
                          No image available
                        </div>
                      )}
                    </div>

                    <div className="mb-2 sm:mb-3">
                      <h3 className="text-xs sm:text-sm md:text-base font-semibold text-neutral-900 mb-1 line-clamp-2">
                        {product.name || "Unnamed Product"}
                      </h3>
                      <p className="text-base sm:text-lg md:text-xl font-bold text-emerald-600">
                        ₹ {product.price || "Price not available"}
                      </p>
                    </div>

                    <motion.button
                      onClick={() => handleBuyNow(product)}
                      className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold py-1.5 sm:py-2 px-3 sm:px-4 text-xs sm:text-sm rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Buy Now
                    </motion.button>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-8 sm:py-12 text-neutral-500 text-sm sm:text-base">
                  No products available
                </div>
              )}
            </motion.div>

            {Array.isArray(womenJeans) && displayedProducts < womenJeans.length && (
              <motion.div className="flex justify-center" variants={itemVariants}>
                <motion.button
                  onClick={handleShowMore}
                  className="px-6 sm:px-8 py-2 sm:py-3 border-2 border-emerald-600 text-emerald-600 font-semibold text-sm sm:text-base rounded-lg hover:bg-emerald-50 transition-all duration-300 shadow-md hover:shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Show More
                </motion.button>
              </motion.div>
            )}
          </motion.section>

          {/* Carousel Section */}
          <motion.section
            className="mb-12 sm:mb-16"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="relative bg-white rounded-xl overflow-hidden p-4 sm:p-6 md:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <motion.h3
                className="text-lg sm:text-xl md:text-2xl font-bold text-neutral-900 mb-4 sm:mb-6"
                variants={itemVariants}
              >
                Top Categories
              </motion.h3>

              <div className="flex items-center gap-2 sm:gap-4">
                <motion.button
                  onClick={prevSlide}
                  className="p-1.5 sm:p-2 hover:bg-neutral-100 rounded-full transition-colors flex-shrink-0"
                  aria-label="Previous slide"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <img className="w-4 h-4 sm:w-5 sm:h-5" src="/left.png" alt="Previous" />
                </motion.button>

                <div className="flex-1 overflow-hidden">
                  <Slider ref={sliderRef} {...settings}>
                    {images.map((image, index) => (
                      <motion.div
                        key={index}
                        className="px-1 sm:px-2"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                      >
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`Category ${index}`}
                          className="w-full h-24 sm:h-32 md:h-40 lg:h-48 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                        />
                      </motion.div>
                    ))}
                  </Slider>
                </div>

                <motion.button
                  onClick={nextSlide}
                  className="p-1.5 sm:p-2 hover:bg-neutral-100 rounded-full transition-colors flex-shrink-0"
                  aria-label="Next slide"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <img className="w-4 h-4 sm:w-5 sm:h-5" src="/right.png" alt="Next" />
                </motion.button>
              </div>

              <TopCategories />
            </div>
          </motion.section>

          {/* Style Showcase */}
          <motion.section
            className="mb-12 sm:mb-16"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6"
              variants={containerVariants}
            >
              {imageFames.map((imageName, index) => (
                <motion.div
                  key={index}
                  className="relative rounded-xl overflow-hidden aspect-square shadow-lg hover:shadow-xl cursor-pointer"
                  variants={itemVariants}
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setActiveSlider(index)}
                >
                  <motion.img 
                    className="w-full h-full object-cover" 
                    src={`/${imageName}.webp`} 
                    alt={imageName}
                    initial={false}
                    animate={{
                      filter: index === activeSlider ? "brightness(1)" : "brightness(0.6)",
                      scale: index === activeSlider ? 1 : 0.95
                    }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  />
                  <motion.div 
                    className="absolute inset-0 flex items-center justify-center"
                    initial={false}
                    animate={{
                      backgroundColor: index === activeSlider ? "rgba(0,0,0,0.1)" : "rgba(0,0,0,0.4)"
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.span 
                      className="text-white font-bold text-base sm:text-lg md:text-xl capitalize px-4 py-2 rounded-lg"
                      initial={false}
                      animate={{
                        scale: index === activeSlider ? 1.1 : 1,
                        backgroundColor: index === activeSlider ? "rgba(16, 185, 129, 0.8)" : "rgba(0,0,0,0.3)"
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {imageName}
                    </motion.span>
                  </motion.div>
                  {index === activeSlider && (
                    <motion.div
                      className="absolute inset-0 border-4 border-emerald-600 rounded-xl pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </motion.div>
              ))}
            </motion.div>
          </motion.section>

          {/* Category Filter Section */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="bg-white rounded-xl p-4 sm:p-6 md:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex flex-col gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div>
                  <motion.h2
                    className="text-xl sm:text-2xl md:text-3xl font-bold text-neutral-900 mb-3 sm:mb-4"
                    variants={itemVariants}
                  >
                    Browse by Category
                  </motion.h2>
                  <motion.div className="flex gap-2 sm:gap-4 flex-wrap" variants={containerVariants}>
                    {["tops", "jeans", "skirts"].map((category) => (
                      <motion.button
                        key={category}
                        onClick={() => handleCategoryClick(category)}
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-semibold text-xs sm:text-sm transition-all duration-200 shadow-md hover:shadow-lg ${
                          selectedCategory === category
                            ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white"
                            : "bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </motion.button>
                    ))}
                  </motion.div>
                </div>
                <motion.p
                  className="text-xs sm:text-sm md:text-base text-neutral-600 font-semibold"
                  variants={itemVariants}
                >
                  Total Products: <span className="text-emerald-600">{filteredProducts.length}</span>
                </motion.p>
              </div>

              {/* Filtered Products Grid */}
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6"
                variants={containerVariants}
              >
                {filteredProducts.slice(0, displayedProducts).map((product, index) => (
                  <motion.div
                    key={index}
                    className="group"
                    onMouseEnter={() => handleProductHovers(index)}
                    onMouseLeave={() => handleProductLeaves()}
                    variants={itemVariants}
                    whileHover={{ y: -8 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Product Image Container */}
                    <div className="relative bg-neutral-100 rounded-xl overflow-hidden mb-3 sm:mb-4 aspect-square shadow-md hover:shadow-xl transition-shadow duration-300">
                      <motion.img
                        className="w-full h-full object-cover absolute inset-0"
                        src={product.imageUrls[0] || "/placeholder.svg"}
                        alt={product.name}
                        initial={false}
                        animate={{ 
                          opacity: hoverIndex === index ? 0 : 1,
                          scale: hoverIndex === index ? 1.05 : 1
                        }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                      />
                      <motion.img
                        className="w-full h-full object-cover absolute inset-0"
                        src={product.imageUrls[1] || product.imageUrls[0]}
                        alt={product.name}
                        initial={false}
                        animate={{ 
                          opacity: hoverIndex === index ? 1 : 0,
                          scale: hoverIndex === index ? 1 : 1.05
                        }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                      />
                    </div>

                    {/* Product Info */}
                    <div className="mb-2 sm:mb-3">
                      <h3 className="text-xs sm:text-sm md:text-base font-semibold text-neutral-900 mb-1 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-base sm:text-lg md:text-xl font-bold text-emerald-600">₹ {product.price}</p>
                    </div>

                    {/* Buy Now Button */}
                    <motion.button
                      onClick={() => handleBuyNow(product)}
                      className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold py-1.5 sm:py-2 px-3 sm:px-4 text-xs sm:text-sm rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Buy Now
                    </motion.button>
                  </motion.div>
                ))}
              </motion.div>

              {/* Show More Button */}
              {displayedProducts < filteredProducts.length && (
                <motion.div className="flex justify-center mt-6 sm:mt-8" variants={itemVariants}>
                  <motion.button
                    onClick={handleShowMore}
                    className="px-6 sm:px-8 py-2 sm:py-3 border-2 border-emerald-600 text-emerald-600 font-semibold text-sm sm:text-base rounded-lg hover:bg-emerald-50 transition-all duration-300 shadow-md hover:shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Show More
                  </motion.button>
                </motion.div>
              )}
            </div>
          </motion.section>
        </div>

        {/* Cart Overlay */}
        <AnimatePresence>
          {isCartOpen && (
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              onClick={handleCartClick}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </AnimatePresence>

        <motion.div
          className="fixed right-0 top-0 h-screen w-full sm:max-w-sm md:max-w-md bg-white shadow-2xl z-50 flex flex-col overflow-hidden"
          initial={{ x: "100%" }}
          animate={{ x: isCartOpen ? 0 : "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          {/* Cart Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 md:p-6 border-b border-neutral-200 bg-gradient-to-r from-emerald-50 to-white">
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900">Shopping Cart</h2>
            <motion.button
              onClick={handleCartClick}
              className="p-1.5 sm:p-2 hover:bg-neutral-100 rounded-full transition-colors flex-shrink-0"
              aria-label="Close cart"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <img className="w-4 h-4 sm:w-5 sm:h-5" src="/close.png" alt="Close" />
            </motion.button>
          </div>

          {/* Cart Items */}
          <motion.div
            className="flex-1 overflow-y-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {cartItems.length > 0 ? (
              <div className="divide-y divide-neutral-200">
                {cartItems.map((item, index) => (
                  <motion.div
                    key={index}
                    className="p-3 sm:p-4 hover:bg-neutral-50 transition-colors"
                    variants={itemVariants}
                  >
                    <div className="flex gap-3 sm:gap-4">
                      {/* Item Image */}
                      <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-neutral-100 rounded-lg overflow-hidden shadow-md">
                        <img
                          src={item.imageUrl || "/placeholder.svg"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-semibold text-neutral-900 text-xs sm:text-sm mb-1">{item.name}</h3>
                          <p className="text-emerald-600 font-bold text-sm sm:text-base">₹{item.price}</p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-1 sm:gap-2 bg-neutral-100 rounded-lg w-fit shadow-sm">
                          <motion.button
                            onClick={() => handleDecreaseQuantity(item.id)}
                            className="p-1 hover:bg-neutral-200 transition-colors text-xs sm:text-sm"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            −
                          </motion.button>
                          <span className="px-1.5 sm:px-2 font-semibold text-neutral-900 text-xs sm:text-sm">
                            {item.quantity}
                          </span>
                          <motion.button
                            onClick={() => handleIncreaseQuantity(item.id)}
                            className="p-1 hover:bg-neutral-200 transition-colors text-xs sm:text-sm"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            +
                          </motion.button>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <motion.button
                        onClick={() => handleRemoveFromCart(item.id)}
                        className="text-neutral-400 hover:text-red-600 transition-colors text-xs font-semibold flex-shrink-0"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Remove
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-neutral-500 text-sm">
                <p>Your cart is empty</p>
              </div>
            )}
          </motion.div>

          {/* Cart Footer */}
          {cartItems.length > 0 && (
            <motion.div
              className="border-t border-neutral-200 p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 bg-gradient-to-t from-emerald-50 to-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.button
                onClick={handlePayment}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold py-2 sm:py-3 px-3 sm:px-4 text-sm sm:text-base rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Proceed to Pay
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </main>
    </>
  )
}

export default withReduxProvider(Home)