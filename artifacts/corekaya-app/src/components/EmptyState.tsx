import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  emoji: string;
  heading: string;
  body?: string;
  ctaLabel?: string;
  onCta?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ emoji, heading, body, ctaLabel, onCta }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center px-6">
    <div className="text-5xl mb-4 select-none">{emoji}</div>
    <h3 className="font-serif text-xl text-charcoal mb-2">{heading}</h3>
    {body && <p className="text-sm text-gray-500 max-w-xs mb-6">{body}</p>}
    {ctaLabel && onCta && (
      <Button variant="outline" size="sm" onClick={onCta}>{ctaLabel}</Button>
    )}
  </div>
);
