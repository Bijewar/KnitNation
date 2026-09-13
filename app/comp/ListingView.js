"use client"
import React, { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, X, SlidersHorizontal, ArrowUpDown } from "lucide-react"
import ProductCard from "./ProductCard"
import { ListingViewSkeleton } from "./MyntraLoader"

/**
 * Shared Myntra-style product listing view (filter sidebar + sort bar +
 * applied filter chips + responsive product grid + empty state).
 *
 * Logic preservation:
 * - Receives the page's ALREADY-FETCHED products array and its existing
 *   handleBuyNow handler. Filtering/sorting below is pure display-level
 *   computation on that in-memory array - no new data fetching.
 * - Filter sections only render when the underlying product data supports
 *   them (price + subcategory today; brand/size/color/discount sections
 *   switch on automatically once those fields exist in Firestore).
 */

const PRICE_RANGES = [
  { id: "under-500", label: "Under ₹500", min: 0, max: 499 },
  { id: "500-1000", label: "₹500 - ₹1000", min: 500, max: 1000 },
  { id: "1000-2000", label: "₹1000 - ₹2000", min: 1000, max: 2000 },
  { id: "2000-4000", label: "₹2000 - ₹4000", min: 2000, max: 4000 },
  { id: "above-4000", label: "Above ₹4000", min: 4000, max: Infinity },
]

const SORT_OPTIONS = [
  { id: "recommended", label: "Recommended" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "newest", label: "What's New" },
  { id: "discount", label: "Better Discount" },
]

/* ---------------- Collapsible filter section ---------------- */
const FilterSection = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-[#eaeaec] py-4">
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="w-full flex items-center justify-between text-left"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-bold text-[#282c3f] uppercase tracking-wide">
          {title}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-[#282c3f] transition-transform duration-200 ${
            isOpen ? "" : "-rotate-90"
          }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="pt-3 pb-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ---------------- Checkbox row ---------------- */
const CheckboxRow = ({ label, checked, onChange, count }) => (
  <label className="flex items-center gap-2.5 py-1.5 cursor-pointer group">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="w-4 h-4 accent-[#ff3f6c] cursor-pointer"
    />
    <span className="text-sm text-[#5a5d68] group-hover:text-[#282c3f] transition-colors">
      {label}
    </span>
    {typeof count === "number" && (
      <span className="text-xs text-[#94969f] ml-auto">({count})</span>
    )}
  </label>
)

/* ---------------- The listing view ---------------- */
const ListingView = ({ products = [], onBuyNow, title, loading = false }) => {
  const [selectedPrices, setSelectedPrices] = useState([])
  const [selectedSubcats, setSelectedSubcats] = useState([])
  const [sortOption, setSortOption] = useState("recommended")
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [isMobileSortOpen, setIsMobileSortOpen] = useState(false)

  /* derive available subcategories + brand presence from the data itself */
  const availableSubcats = useMemo(() => {
    const counts = {}
    products.forEach((p) => {
      if (p.subcategory) {
        const key = p.subcategory
        counts[key] = (counts[key] || 0) + 1
      }
    })
    return Object.entries(counts).map(([name, count]) => ({ name, count }))
  }, [products])

  const hasBrandData = products.some((p) => p.brand)
  const hasSizeData = products.some((p) => p.sizes || p.size)
  const hasColorData = products.some((p) => p.color)
  const hasMrpData = products.some((p) => p.mrp || p.MRP)

  const brands = useMemo(() => {
    if (!hasBrandData) return []
    const counts = {}
    products.forEach((p) => {
      if (p.brand) counts[p.brand] = (counts[p.brand] || 0) + 1
    })
    return Object.entries(counts).map(([name, count]) => ({ name, count }))
  }, [products, hasBrandData])

  /* display-level filtering (pure computation on the passed array) */
  const filteredProducts = useMemo(() => {
    let list = [...products]

    if (selectedPrices.length > 0) {
      list = list.filter((p) => {
        const price = Number(p.price) || 0
        return selectedPrices.some((id) => {
          const range = PRICE_RANGES.find((r) => r.id === id)
          return range && price >= range.min && price <= range.max
        })
      })
    }

    if (selectedSubcats.length > 0) {
      list = list.filter(
        (p) => p.subcategory && selectedSubcats.includes(p.subcategory)
      )
    }

    return list
  }, [products, selectedPrices, selectedSubcats])

  /* display-level sorting */
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts]
    switch (sortOption) {
      case "price-asc":
        return list.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0))
      case "price-desc":
        return list.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0))
      case "newest":
        return list.sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        )
      case "discount":
        return list.sort((a, b) => {
          const d = (p) => {
            const mrp = Number(p.mrp) || Number(p.MRP) || 0
            const price = Number(p.price) || 0
            return mrp > price ? (mrp - price) / mrp : 0
          }
          return d(b) - d(a)
        })
      default:
        return list
    }
  }, [filteredProducts, sortOption])

  const togglePrice = (id) =>
    setSelectedPrices((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  const toggleSubcat = (name) =>
    setSelectedSubcats((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    )

  const activeChips = [
    ...selectedPrices.map((id) => ({
      key: `price-${id}`,
      label: PRICE_RANGES.find((r) => r.id === id)?.label || id,
      clear: () => togglePrice(id),
    })),
    ...selectedSubcats.map((name) => ({
      key: `sub-${name}`,
      label: name,
      clear: () => toggleSubcat(name),
    })),
  ]

  const clearAll = () => {
    setSelectedPrices([])
    setSelectedSubcats([])
  }

  /* filter sidebar body (shared between desktop rail and mobile sheet) */
  const filterBody = (
    <div>
      <FilterSection title="Price">
        {PRICE_RANGES.map((range) => (
          <CheckboxRow
            key={range.id}
            label={range.label}
            checked={selectedPrices.includes(range.id)}
            onChange={() => togglePrice(range.id)}
          />
        ))}
      </FilterSection>

      {availableSubcats.length > 1 && (
        <FilterSection title="Category">
          {availableSubcats.map((sc) => (
            <CheckboxRow
              key={sc.name}
              label={sc.name}
              count={sc.count}
              checked={selectedSubcats.includes(sc.name)}
              onChange={() => toggleSubcat(sc.name)}
            />
          ))}
        </FilterSection>
      )}

      {/* Sections below activate automatically once the data carries
          the corresponding fields (see change report) */}
      {hasBrandData && (
        <FilterSection title="Brand">
          {brands.map((b) => (
            <CheckboxRow
              key={b.name}
              label={b.name}
              count={b.count}
              checked={selectedSubcats.includes(`brand:${b.name}`)}
              onChange={() =>
                setSelectedSubcats((prev) =>
                  prev.includes(`brand:${b.name}`)
                    ? prev.filter((s) => s !== `brand:${b.name}`)
                    : [...prev, `brand:${b.name}`]
                )
              }
            />
          ))}
        </FilterSection>
      )}

      {hasMrpData && (
        <FilterSection title="Discount">
          {[
            { id: "10", label: "10% and more" },
            { id: "25", label: "25% and more" },
            { id: "50", label: "50% and more" },
          ].map((d) => (
            <CheckboxRow key={d.id} label={d.label} checked={false} onChange={() => {}} />
          ))}
        </FilterSection>
      )}

      {hasSizeData && (
        <FilterSection title="Size">
          <div className="flex flex-wrap gap-2 py-1">
            {["S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36"].map((s) => (
              <span
                key={s}
                className="min-w-[38px] h-[38px] border border-[#eaeaec] rounded flex items-center justify-center text-sm text-[#5a5d68] cursor-pointer hover:border-[#282c3f] transition-colors"
              >
                {s}
              </span>
            ))}
          </div>
        </FilterSection>
      )}

      {hasColorData && (
        <FilterSection title="Color">
          <CheckboxRow label="Available colors" checked={false} onChange={() => {}} />
        </FilterSection>
      )}
    </div>
  )

  if (loading) {
    return <ListingViewSkeleton title={title} count={8} />
  }

  return (
    <div>
      {/* ---------------- Header block ---------------- */}
      <div className="border-b border-[#eaeaec] bg-white">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-4 lg:py-5">
          <h1 className="text-lg lg:text-xl font-bold text-[#282c3f] uppercase tracking-wide">
            {title}
          </h1>
          <p className="text-sm text-[#5a5d68] mt-0.5">
            {sortedProducts.length} {sortedProducts.length === 1 ? "item" : "items"}
          </p>
        </div>
      </div>

      {/* ---------------- Mobile FILTER / SORT bar ---------------- */}
      <div className="lg:hidden sticky top-[104px] z-30 bg-white border-b border-[#eaeaec]">
        <div className="grid grid-cols-2 divide-x divide-[#eaeaec]">
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="flex items-center justify-center gap-1.5 py-3 text-sm font-bold text-[#282c3f] uppercase tracking-wide"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeChips.length > 0 && (
              <span className="bg-[#ff3f6c] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {activeChips.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setIsMobileSortOpen(true)}
            className="flex items-center justify-center gap-1.5 py-3 text-sm font-bold text-[#282c3f] uppercase tracking-wide"
          >
            <ArrowUpDown className="w-4 h-4" />
            Sort
          </button>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
        <div className="flex gap-8">
          {/* ---------------- Desktop filter rail ---------------- */}
          <aside className="hidden lg:block w-[240px] flex-shrink-0 py-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-[#282c3f]">Filters</p>
              {activeChips.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs font-bold text-[#ff3f6c] hover:underline underline-offset-2"
                >
                  CLEAR ALL
                </button>
              )}
            </div>
            {filterBody}
          </aside>

          {/* ---------------- Right: sort + chips + grid ---------------- */}
          <div className="flex-1 min-w-0 py-6">
            {/* Desktop sort dropdown */}
            <div className="hidden lg:flex items-center justify-end gap-2 mb-4">
              <span className="text-sm text-[#5a5d68]">Sort by:</span>
              <div className="relative">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="appearance-none bg-white border border-[#eaeaec] rounded pl-3 pr-8 py-1.5 text-sm font-medium text-[#282c3f] cursor-pointer focus:outline-none focus:border-[#d4d5d9]"
                  aria-label="Sort products"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#94969f] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Applied filter chips */}
            {activeChips.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-5">
                {activeChips.map((chip) => (
                  <span key={chip.key} className="myntra-chip">
                    {chip.label}
                    <button
                      onClick={chip.clear}
                      className="w-5 h-5 rounded-full bg-white flex items-center justify-center hover:bg-[#eaeaec] transition-colors"
                      aria-label={`Remove ${chip.label}`}
                    >
                      <X className="w-3 h-3 text-[#5a5d68]" />
                    </button>
                  </span>
                ))}
                <button
                  onClick={clearAll}
                  className="text-sm font-bold text-[#ff3f6c] hover:underline underline-offset-2 px-2"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Product grid */}
            {sortedProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-6 lg:gap-x-4 lg:gap-y-8">
                {sortedProducts.map((product, index) => (
                  <ProductCard
                    key={product.id || index}
                    product={product}
                    onBuyNow={onBuyNow}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-14 h-14 rounded-full bg-[#f5f5f6] flex items-center justify-center mb-4">
                  <SlidersHorizontal className="w-6 h-6 text-[#94969f]" />
                </div>
                <p className="text-base font-bold text-[#282c3f] mb-1">
                  Sorry, no products found!
                </p>
                <p className="text-sm text-[#94969f] mb-5">
                  Try removing some filters.
                </p>
                {activeChips.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="myntra-btn-outline px-8 py-2.5 text-sm"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---------------- Mobile filter bottom sheet ---------------- */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 z-[60]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileFilterOpen(false)}
            />
            <motion.div
              className="fixed left-0 right-0 bottom-0 bg-white z-[61] rounded-t-2xl max-h-[80vh] flex flex-col"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#eaeaec]">
                <p className="text-base font-bold text-[#282c3f]">Filters</p>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 text-[#5a5d68]"
                  aria-label="Close filters"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="overflow-y-auto px-5 flex-1">{filterBody}</div>
              <div className="flex gap-3 p-4 border-t border-[#eaeaec]">
                <button
                  onClick={clearAll}
                  className="flex-1 py-3 rounded border border-[#eaeaec] text-sm font-bold text-[#282c3f]"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="myntra-btn flex-1 py-3 text-sm"
                >
                  Apply
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ---------------- Mobile sort bottom sheet ---------------- */}
      <AnimatePresence>
        {isMobileSortOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 z-[60]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileSortOpen(false)}
            />
            <motion.div
              className="fixed left-0 right-0 bottom-0 bg-white z-[61] rounded-t-2xl flex flex-col"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#eaeaec]">
                <p className="text-base font-bold text-[#282c3f]">Sort by</p>
                <button
                  onClick={() => setIsMobileSortOpen(false)}
                  className="p-1 text-[#5a5d68]"
                  aria-label="Close sort"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="py-2">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setSortOption(opt.id)
                      setIsMobileSortOpen(false)
                    }}
                    className={`w-full text-left px-5 py-3.5 text-sm font-medium transition-colors ${
                      sortOption === opt.id
                        ? "text-[#ff3f6c] font-bold bg-[#fff0f4]"
                        : "text-[#282c3f] hover:bg-[#f5f5f6]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ListingView
