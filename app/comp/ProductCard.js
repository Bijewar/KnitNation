"use client"
import React, { useState } from "react"
import { motion } from "framer-motion"
import { Heart, Star } from "lucide-react"

/**
 * Shared Myntra-style product card.
 *
 * Logic preservation:
 * - Clicking the card calls the SAME page-level handleBuyNow handler,
 *   passed in as `onBuyNow`, which routes to /product/[id].
 * - The hover image-swap behavior of the previous cards (crossfade from
 *   imageUrls[0] to imageUrls[1]) is preserved, now encapsulated here.
 * - The wishlist heart is display-only (local UI state) because no wishlist
 *   feature exists in the codebase yet - see the change report.
 * - MRP / discount / rating render only when the fields exist in the data.
 */
const ProductCard = ({ product, onBuyNow, index = 0 }) => {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  if (!product) return null

  const handleCardClick = () => {
    if (onBuyNow && product.id) {
      onBuyNow(product)
    }
  }

  const handleWishlistClick = (e) => {
    e.stopPropagation()
    e.preventDefault()
    setIsWishlisted((prev) => !prev)
  }

  const primaryImage =
    (product.imageUrls && product.imageUrls[0]) || "/placeholder.svg"
  const secondaryImage =
    (product.imageUrls && (product.imageUrls[1] || product.imageUrls[0])) ||
    "/placeholder.svg"

  const price = Number(product.price) || product.price
  const mrp = Number(product.mrp) || Number(product.MRP) || null
  const discount =
    mrp && price && mrp > price
      ? Math.round(((mrp - price) / mrp) * 100)
      : null
  const rating = Number(product.rating) || Number(product.ratings) || null
  const ratingCount = product.ratingCount || product.ratingsCount || null

  const handleImageError = (e) => {
    // Graceful fallback when the product image cannot load (e.g. expired
    // Firebase Storage token / restricted rules - see change report).
    if (e.currentTarget.src !== window.location.origin + "/placeholder.svg") {
      e.currentTarget.src = "/placeholder.svg"
    }
  }

  return (
    <div
      className="group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
      role="link"
      aria-label={product.name}
    >
      {/* Image area */}
      <div className="relative bg-[#f5f5f6] rounded-lg overflow-hidden aspect-[3/4] mb-2.5">
        {product.imageUrls && product.imageUrls.length > 0 ? (
          <>
            <motion.img
              className="w-full h-full object-cover absolute inset-0"
              src={primaryImage}
              alt={product.name || "Product"}
              onError={handleImageError}
              initial={false}
              animate={{
                opacity: isHovered ? 0 : 1,
                scale: isHovered ? 1.04 : 1,
              }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            />
            <motion.img
              className="w-full h-full object-cover absolute inset-0"
              src={secondaryImage}
              alt={product.name || "Product"}
              onError={handleImageError}
              initial={false}
              animate={{
                opacity: isHovered ? 1 : 0,
                scale: isHovered ? 1 : 1.04,
              }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#94969f] text-sm">
            No image available
          </div>
        )}

        {/* Wishlist heart - display only (no wishlist backend yet) */}
        <button
          onClick={handleWishlistClick}
          className="absolute top-2.5 right-2.5 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-[0_1px_4px_rgba(40,44,63,0.16)] transition-transform active:scale-90"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={isWishlisted}
        >
          <Heart
            className={`w-4 h-4 transition-all duration-200 ${
              isWishlisted ? "fill-[#ff3f6c] text-[#ff3f6c]" : "text-[#5a5d68]"
            }`}
          />
        </button>

        {/* Rating badge - only when rating exists in data */}
        {rating && rating > 0 && (
          <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 bg-white rounded px-1.5 py-0.5 text-xs font-bold text-[#282c3f] shadow-[0_1px_4px_rgba(40,44,63,0.16)]">
            {Number(rating).toFixed(1)}
            <Star className="w-3 h-3 fill-[#1a9c3e] text-[#1a9c3e]" />
            {ratingCount ? `(${ratingCount})` : ""}
          </span>
        )}
      </div>

      {/* Info area */}
      <div className="px-0.5">
        <h3 className="myntra-brand">KnitNation</h3>
        <p className="myntra-card-subtitle line-clamp-1-custom">
          {product.name || "Unnamed Product"}
        </p>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="myntra-card-price text-base">
            ₹ {product.price ?? "—"}
          </span>
          {mrp && (
            <span className="myntra-card-mrp">₹ {mrp.toLocaleString("en-IN")}</span>
          )}
          {discount && (
            <span className="myntra-card-discount">({discount}% OFF)</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductCard
