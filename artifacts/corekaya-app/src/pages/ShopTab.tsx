import React, { useState } from 'react';
import { useListProducts, Product } from '@workspace/api-client-react';
import { ProductCard } from '../components/ProductCard';
import { ProductModal } from '../components/ProductModal';

const SHOP_CATEGORIES = ['All', 'Large Equipment', 'Small Props', 'Accessories', 'Bundles'];

export function ShopTab() {
  const [filter, setFilter] = useState<string>('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { data: products = [], isLoading } = useListProducts(
    filter === 'All' ? undefined : { category: filter }
  );

  return (
    <div className="min-h-screen bg-sand pb-24 relative">
      <header className="px-6 pt-12 pb-6 bg-white sticky top-0 z-40 shadow-sm">
        <h1 className="font-serif text-3xl text-charcoal mb-2">The Shop</h1>
        <p className="text-gray-500 text-sm">Curated apparatus and essentials.</p>

        <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar pb-1">
          {SHOP_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider whitespace-nowrap rounded-full transition-all
                ${filter === cat
                  ? 'bg-charcoal text-white shadow-md'
                  : 'bg-sand-dark text-gray-500 hover:bg-sand'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      <div className="px-4 py-6 grid grid-cols-2 gap-4">
        {isLoading ? (
          <>
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="w-full aspect-square rounded-xl bg-gray-200 animate-pulse" />
            ))}
          </>
        ) : products.length > 0 ? (
          products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onOpen={setSelectedProduct}
            />
          ))
        ) : (
          <div className="col-span-2 flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-3xl mb-4 grayscale opacity-50">
              🛍️
            </div>
            <h3 className="font-serif text-lg text-charcoal mb-1">Nothing in {filter}</h3>
            <p className="text-sm text-gray-400">Check back soon for new arrivals.</p>
          </div>
        )}
      </div>

      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
