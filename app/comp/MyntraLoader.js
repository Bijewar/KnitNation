"use client";
import React from 'react';

/**
 * Myntra-style brand spinner with dual-ring pink gradient
 */
export const MyntraSpinner = ({ size = "md", text = "" }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div className={size === "sm" ? "myntra-spinner-sm" : "myntra-spinner"} />
      {text && (
        <p className="text-xs font-semibold text-[#5a5d68] tracking-wider uppercase">
          {text}
        </p>
      )}
    </div>
  );
};

/**
 * Single Myntra-style Product Card Skeleton with 3:4 aspect ratio & shimmer
 */
export const ProductCardSkeleton = () => {
  return (
    <div className="flex flex-col bg-white rounded border border-[#eaeaec] overflow-hidden">
      {/* 3:4 Aspect ratio image box with shimmer */}
      <div className="w-full aspect-[3/4] myntra-shimmer relative" />

      {/* Card Info */}
      <div className="p-3">
        {/* Brand bar */}
        <div className="h-3.5 w-2/5 myntra-shimmer rounded mb-2" />
        {/* Product title bar */}
        <div className="h-3 w-4/5 myntra-shimmer rounded mb-2.5" />
        {/* Price & discount row */}
        <div className="flex items-center gap-2">
          <div className="h-4 w-16 myntra-shimmer rounded" />
          <div className="h-3 w-12 myntra-shimmer rounded" />
          <div className="h-3 w-10 myntra-shimmer rounded" />
        </div>
      </div>
    </div>
  );
};

/**
 * Full Product Listing Page (PLP) Skeleton matching Myntra's desktop & mobile layout
 */
export const ListingViewSkeleton = ({ title = "Collection", count = 8 }) => {
  return (
    <div>
      {/* Top Header Placeholder */}
      <div className="border-b border-[#eaeaec] bg-white">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-4 lg:py-5 flex items-center justify-between">
          <div>
            <div className="h-5 w-44 myntra-shimmer rounded mb-1.5" />
            <div className="h-3.5 w-24 myntra-shimmer rounded" />
          </div>
          <div className="hidden lg:block h-9 w-44 myntra-shimmer rounded" />
        </div>
      </div>

      {/* Mobile filter bar placeholder */}
      <div className="lg:hidden bg-white border-b border-[#eaeaec] p-3 flex justify-around">
        <div className="h-4 w-20 myntra-shimmer rounded" />
        <div className="h-4 w-20 myntra-shimmer rounded" />
      </div>

      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-6">
        <div className="flex gap-8">
          {/* Left Filter Sidebar Skeleton (Desktop only) */}
          <aside className="hidden lg:block w-[240px] flex-shrink-0">
            <div className="border border-[#eaeaec] rounded p-4 space-y-6">
              <div className="h-4 w-24 myntra-shimmer rounded" />
              <div className="space-y-3 pt-2 border-t border-[#eaeaec]">
                <div className="h-3.5 w-28 myntra-shimmer rounded" />
                <div className="h-3 w-36 myntra-shimmer rounded" />
                <div className="h-3 w-32 myntra-shimmer rounded" />
                <div className="h-3 w-40 myntra-shimmer rounded" />
              </div>
              <div className="space-y-3 pt-3 border-t border-[#eaeaec]">
                <div className="h-3.5 w-20 myntra-shimmer rounded" />
                <div className="h-3 w-28 myntra-shimmer rounded" />
                <div className="h-3 w-32 myntra-shimmer rounded" />
              </div>
              <div className="space-y-3 pt-3 border-t border-[#eaeaec]">
                <div className="h-3.5 w-24 myntra-shimmer rounded" />
                <div className="h-3 w-32 myntra-shimmer rounded" />
                <div className="h-3 w-24 myntra-shimmer rounded" />
              </div>
            </div>
          </aside>

          {/* Right Product Grid Skeletons */}
          <div className="flex-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-5">
              {Array.from({ length: count }).map((_, idx) => (
                <ProductCardSkeleton key={idx} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Product Details Page (PDP) Skeleton
 */
export const ProductDetailsSkeleton = () => {
  return (
    <div className="max-w-[1300px] mx-auto px-4 lg:px-8 py-6">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2 mb-6">
        <div className="h-3 w-14 myntra-shimmer rounded" />
        <span className="text-gray-300">/</span>
        <div className="h-3 w-20 myntra-shimmer rounded" />
        <span className="text-gray-300">/</span>
        <div className="h-3 w-32 myntra-shimmer rounded" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Gallery Skeleton (Desktop 2-col or single main image) */}
        <div className="lg:col-span-7">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="aspect-[3/4] myntra-shimmer rounded" />
            <div className="hidden sm:block aspect-[3/4] myntra-shimmer rounded" />
            <div className="hidden sm:block aspect-[3/4] myntra-shimmer rounded" />
            <div className="hidden sm:block aspect-[3/4] myntra-shimmer rounded" />
          </div>
        </div>

        {/* Right Product Details Info Skeleton */}
        <div className="lg:col-span-5 space-y-5">
          {/* Brand & title */}
          <div>
            <div className="h-6 w-36 myntra-shimmer rounded mb-2" />
            <div className="h-4 w-3/4 myntra-shimmer rounded mb-3" />
            <div className="h-6 w-20 myntra-shimmer rounded" />
          </div>

          <div className="border-t border-[#eaeaec] pt-4">
            {/* Price */}
            <div className="flex items-center gap-3 mb-4">
              <div className="h-7 w-28 myntra-shimmer rounded" />
              <div className="h-5 w-20 myntra-shimmer rounded" />
              <div className="h-5 w-20 myntra-shimmer rounded" />
            </div>
            <div className="h-3 w-32 myntra-shimmer rounded" />
          </div>

          {/* Size selection */}
          <div className="border-t border-[#eaeaec] pt-4 space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-4 w-24 myntra-shimmer rounded" />
              <div className="h-3.5 w-20 myntra-shimmer rounded" />
            </div>
            <div className="flex items-center gap-3">
              {['28', '30', '32', '34', '36'].map((sz) => (
                <div key={sz} className="w-12 h-12 rounded-full myntra-shimmer" />
              ))}
            </div>
          </div>

          {/* Action buttons (Add to Bag & Wishlist) */}
          <div className="flex gap-4 pt-2">
            <div className="flex-1 h-13 myntra-shimmer rounded bg-[#ff3f6c]/20" />
            <div className="w-36 h-13 myntra-shimmer rounded" />
          </div>

          {/* Delivery & Pincode Box */}
          <div className="border border-[#eaeaec] rounded p-4 space-y-3 mt-6">
            <div className="h-4 w-36 myntra-shimmer rounded" />
            <div className="h-10 w-full myntra-shimmer rounded" />
            <div className="h-3 w-56 myntra-shimmer rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Order History Skeleton
 */
export const OrderHistorySkeleton = () => {
  return (
    <div className="max-w-[1000px] mx-auto px-4 lg:px-8 py-8 lg:py-12 space-y-6">
      <div>
        <div className="h-6 w-44 myntra-shimmer rounded mb-2" />
        <div className="h-4 w-72 myntra-shimmer rounded" />
      </div>

      <div className="space-y-4">
        {[1, 2, 3].map((item) => (
          <div key={item} className="bg-white border border-[#eaeaec] rounded-lg p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-[#eaeaec] pb-3">
              <div className="h-4 w-40 myntra-shimmer rounded" />
              <div className="h-5 w-24 myntra-shimmer rounded" />
            </div>
            <div className="flex items-center gap-4">
              <div className="w-18 h-24 myntra-shimmer rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/2 myntra-shimmer rounded" />
                <div className="h-3 w-1/4 myntra-shimmer rounded" />
                <div className="h-4 w-20 myntra-shimmer rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyntraSpinner;
