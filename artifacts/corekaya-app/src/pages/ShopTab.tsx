import { useState } from "react";
import { useListProducts } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ProductCard";
import { ProductModal } from "@/components/ProductModal";
import { Product } from "@workspace/api-client-react";

const CATEGORIES = ["All", "Large Equipment", "Small Props", "Accessories", "Bundles"];

export function ShopTab() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { data: products = [], isLoading } = useListProducts(
    activeFilter === "All" ? undefined : { category: activeFilter }
  );

  return (
    <div className="pb-32 min-h-screen bg-sand">
      {/* Header */}
      <div className="pt-12 px-6 pb-6 bg-white sticky top-0 z-40 border-b border-gray-100">
        <h1 className="font-serif text-3xl font-bold text-navy mb-4">The Shop</h1>

        {/* Filter Scroll */}
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setActiveFilter(category)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeFilter === category
                  ? "bg-navy text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="p-6">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="w-full aspect-square rounded-xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {products.map(product => (
              <ProductCard 
                key={product.id}
                product={product}
                onClick={setSelectedProduct}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <h3 className="font-serif text-xl font-bold text-navy mb-2">No Products Found</h3>
            <p className="text-gray-500">We couldn't find any products in this category.</p>
          </div>
        )}
      </div>

      {selectedProduct && (
        <ProductModal 
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}