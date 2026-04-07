import { Heart } from "lucide-react";
import { Product } from "@workspace/api-client-react";
import { useGetUserWishlist, useToggleWishlistProduct, getGetUserWishlistQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "./ui/Button";

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const queryClient = useQueryClient();
  const { data: wishlistData } = useGetUserWishlist();
  const toggleWishlist = useToggleWishlistProduct();

  const isWishlisted = wishlistData?.wishlist.includes(product.id) || false;

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Optimistic update
    const previousWishlist = queryClient.getQueryData(getGetUserWishlistQueryKey());
    queryClient.setQueryData(getGetUserWishlistQueryKey(), (old: any) => {
      if (!old) return { wishlist: [product.id] };
      const newWishlist = isWishlisted 
        ? old.wishlist.filter((id: number) => id !== product.id)
        : [...old.wishlist, product.id];
      return { ...old, wishlist: newWishlist };
    });

    toggleWishlist.mutate({ data: { productId: product.id } }, {
      onError: () => {
        // Revert on error
        queryClient.setQueryData(getGetUserWishlistQueryKey(), previousWishlist);
      }
    });
  };

  return (
    <div 
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100 group flex flex-col h-full"
      onClick={() => onClick(product)}
      data-testid={`product-card-${product.id}`}
    >
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img 
          src={product.imageUrl} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Top Badges/Icons */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm bg-white/80 backdrop-blur-sm text-navy">
            {product.category}
          </span>
          <button
            onClick={handleWishlistToggle}
            className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-gray-400 hover:text-orange transition-colors"
            data-testid={`wishlist-toggle-${product.id}`}
          >
            <Heart size={16} className={isWishlisted ? "fill-orange text-orange" : ""} />
          </button>
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-serif text-navy font-bold leading-tight mb-1 text-base">
          {product.name}
        </h3>
        <p className="text-orange font-medium text-sm mb-3">
          {product.priceDisplay}
        </p>
        <p className="text-gray-500 text-xs line-clamp-2 mb-4 flex-1">
          {product.description}
        </p>
        <Button variant="outline" size="sm" fullWidth className="mt-auto pointer-events-none group-hover:bg-navy group-hover:text-white transition-colors">
          View Details
        </Button>
      </div>
    </div>
  );
}