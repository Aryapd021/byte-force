import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

export default function RatingStars({ rating, maxRating = 5, interactive = false, onChange, size = 'md' }: RatingStarsProps) {
  const sizeClasses = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' };

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxRating }, (_, i) => {
        const filled = i < Math.floor(rating);
        const half = !filled && i < rating;
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(i + 1)}
            className={interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}
          >
            <Star
              className={`${sizeClasses[size]} ${
                filled ? 'fill-warning text-warning' :
                half ? 'fill-warning/50 text-warning' :
                'text-gray-300'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
