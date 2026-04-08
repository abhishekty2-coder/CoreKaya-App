import React from 'react';

interface FavoriteToggleButtonProps {
  isActive: boolean;
  onToggle: (e: React.MouseEvent) => void;
  size?: 'sm' | 'md';
}

export const FavoriteToggleButton: React.FC<FavoriteToggleButtonProps> = ({
  isActive,
  onToggle,
  size = 'md',
}) => {
  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <button
      onClick={onToggle}
      className="flex items-center justify-center focus:outline-none"
      aria-label={isActive ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <svg
        className={`${iconSize} transition-all duration-300 ease-out ${
          isActive ? 'text-orange fill-orange scale-110' : 'text-gray-400 fill-transparent hover:text-orange'
        }`}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={isActive ? 0 : 2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
};
