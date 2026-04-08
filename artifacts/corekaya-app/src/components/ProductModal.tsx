import React from 'react';
import { Product } from '@workspace/api-client-react';
import { Button } from './Button';
import { ICONS } from '../constants';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  if (!product) return null;

  const handleBuy = () => {
    window.open('https://corekaya.com/', '_blank');
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 pb-36">
      <div
        className="absolute inset-0 bg-navy/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[70vh] overflow-y-auto flex flex-col animate-[fadeIn_0.2s_ease-out]">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center bg-white/80 rounded-full text-charcoal hover:bg-gray-100 transition-colors"
        >
          ✕
        </button>

        <div className="relative aspect-square bg-gray-50 flex-shrink-0">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-4">
            <span className="bg-navy text-white px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md shadow-lg">
              {product.category}
            </span>
          </div>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-start mb-2">
            <h2 className="font-serif text-2xl text-navy leading-tight">{product.name}</h2>
            <span className="text-xl font-medium text-orange ml-4 whitespace-nowrap">{product.priceDisplay}</span>
          </div>

          <div className="w-12 h-0.5 bg-gray-200 my-4" />

          <p className="text-gray-600 leading-relaxed text-sm mb-8">
            {product.description}
          </p>

          <Button
            fullWidth
            size="lg"
            variant="primary"
            onClick={handleBuy}
            className="shadow-lg shadow-navy/20 gap-2"
          >
            <span>{ICONS.SHOP}</span> Buy Now
          </Button>

          <p className="text-[10px] text-center text-gray-400 mt-4">
            You will be redirected to the CoreKaya secure checkout.
          </p>
        </div>
      </div>
    </div>
  );
};
