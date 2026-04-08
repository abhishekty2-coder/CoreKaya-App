import React from 'react';
import { Product } from '@workspace/api-client-react';
import { Button } from './Button';
import { useUser } from '../context/UserContext';
import { FavoriteToggleButton } from './FavoriteToggleButton';

interface ProductCardProps {
  product: Product;
  onOpen: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpen }) => {
  const { isProductInWishlist, toggleWishlistProduct } = useUser();
  const isWishlisted = isProductInWishlist(product.id);

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlistProduct(product.id);
  };

  return (
    <div
      onClick={() => onOpen(product)}
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group relative"
      data-testid={`product-card-${product.id}`}
    >
      <div className="relative aspect-square bg-gray-50">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-90 group-hover:opacity-100 transition-opacity"
          loading="lazy"
        />
        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold tracking-wide uppercase text-charcoal/80">
          {product.category === 'Large Equipment' ? 'Equipment' : 'Prop'}
        </div>

        <div className="absolute top-2 right-2 z-10">
          <div className="bg-white/80 backdrop-blur-sm rounded-full p-1.5 shadow-sm">
            <FavoriteToggleButton
              isActive={isWishlisted}
              onToggle={handleToggleWishlist}
              size="sm"
            />
          </div>
        </div>
      </div>

      <div className="p-3">
        <h3 className="font-serif text-base leading-tight mb-1 text-charcoal h-10 overflow-hidden line-clamp-2">
          {product.name}
        </h3>
        <p className="text-sm font-medium text-navy-dark mb-2">
          {product.priceDisplay}
        </p>

        <p className="text-xs text-gray-500 mb-3 line-clamp-2 h-8 leading-4">
          {product.description}
        </p>

        <Button
          variant="outline"
          fullWidth
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onOpen(product);
          }}
          className="text-xs font-bold tracking-wider uppercase border-navy/30 hover:bg-navy hover:border-navy"
        >
          View Details
        </Button>
      </div>
    </div>
  );
};
