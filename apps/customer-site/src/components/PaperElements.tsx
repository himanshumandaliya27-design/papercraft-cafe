import React, { useState } from 'react';
import { Coffee, Scissors } from 'lucide-react';

interface ResilientImageProps {
  src?: string;
  thumbSrc?: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
  aspectRatio?: string;
}

export const ResilientImage: React.FC<ResilientImageProps> = ({
  src,
  thumbSrc,
  alt,
  className = '',
  fallbackLabel,
  aspectRatio = '4/3',
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const initial = (fallbackLabel || alt || 'A').trim().charAt(0).toUpperCase();
  const isMissing = !src || src.trim() === '' || src.includes('placeholder');

  if (hasError || isMissing) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#EFE4D2] text-[#2B1B14] p-4 text-center select-none relative overflow-hidden paper-grain border border-[#B98A5E]/40 ${className}`}
        style={{ aspectRatio }}
        role="img"
        aria-label={alt}
      >
        <div className="w-12 h-12 rounded-full border-2 border-[#C65D3B] bg-[#FAF5EC] flex items-center justify-center shadow-xs mb-1.5">
          <span className="font-serif-display text-xl font-bold text-[#C65D3B]">
            {initial}
          </span>
        </div>
        <span className="font-serif-display text-xs font-semibold text-[#2B1B14] line-clamp-1 max-w-[85%]">
          {fallbackLabel || alt}
        </span>
        <span className="font-handwritten text-xs text-[#8C7A70] mt-0.5">
          Atelier Vélin
        </span>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden bg-[#EFE4D2] ${className}`}
      style={{ aspectRatio }}
    >
      {/* Paper-tone placeholder while image is decoding/loading */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-[#EFE4D2] paper-grain animate-pulse flex items-center justify-center">
          <span className="w-8 h-8 rounded-full border border-[#B98A5E]/30 bg-[#FAF5EC]/60 flex items-center justify-center font-serif text-xs text-[#B98A5E]">
            {initial}
          </span>
        </div>
      )}
      <img
        src={src}
        srcSet={thumbSrc ? `${thumbSrc} 400w, ${src} 1200w` : undefined}
        sizes={thumbSrc ? '(max-width: 640px) 400px, 1200px' : undefined}
        alt={alt}
        referrerPolicy="no-referrer"
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};

interface WashiTapeProps {
  variant?: 'terracotta' | 'kraft';
  position?: 'top-center' | 'top-left' | 'top-right' | 'bottom-right' | 'corners' | 'top-left-right';
  className?: string;
  label?: string;
}

export const WashiTape: React.FC<WashiTapeProps> = ({
  variant = 'terracotta',
  position = 'top-center',
  className = '',
  label,
}) => {
  const baseStyle =
    variant === 'terracotta' ? 'washi-tape text-[#FAF5EC]' : 'washi-tape-kraft text-[#2B1B14]';

  const posStyles: Record<string, string> = {
    'top-center': '-top-3.5 left-1/2 -translate-x-1/2 -rotate-2 w-28 h-7',
    'top-left': '-top-3 -left-4 -rotate-35 w-24 h-6',
    'top-right': '-top-3 -right-4 rotate-35 w-24 h-6',
    'bottom-right': '-bottom-3 -right-4 -rotate-25 w-22 h-6',
    'corners': '-top-3 -left-3 -rotate-30 w-24 h-6',
    'top-left-right': '-top-3.5 left-1/2 -translate-x-1/2 -rotate-1 w-32 h-7',
  };

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute z-20 flex items-center justify-center select-none ${baseStyle} ${posStyles[position]} ${className}`}
    >
      {label && (
        <span className="font-handwritten text-xs tracking-wide opacity-90 whitespace-nowrap px-2">
          {label}
        </span>
      )}
    </div>
  );
};

interface ZigZagFoldDividerProps {
  foldLabel?: string;
}

export const ZigZagFoldDivider: React.FC<ZigZagFoldDividerProps> = ({ foldLabel }) => {
  return (
    <div className="relative w-full py-6 select-none overflow-hidden" aria-hidden="true">
      {/* Subtle light crease gradient band */}
      <div className="w-full h-7 paper-crease-horizontal flex items-center justify-center relative">
        {/* SVG Zig-Zag Paper Fold Seam */}
        <svg
          className="w-full h-3.5 text-[#B98A5E]/45"
          viewBox="0 0 1200 14"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d="M0 7 L15 1 L30 13 L45 1 L60 13 L75 1 L90 13 L105 1 L120 13 L135 1 L150 13 L165 1 L180 13 L195 1 L210 13 L225 1 L240 13 L255 1 L270 13 L285 1 L300 13 L315 1 L330 13 L345 1 L360 13 L375 1 L390 13 L405 1 L420 13 L435 1 L450 13 L465 1 L480 13 L495 1 L510 13 L525 1 L540 13 L555 1 L570 13 L585 1 L600 13 L615 1 L630 13 L645 1 L660 13 L675 1 L690 13 L705 1 L720 13 L735 1 L750 13 L765 1 L780 13 L795 1 L810 13 L825 1 L840 13 L855 1 L870 13 L885 1 L900 13 L915 1 L930 13 L945 1 L960 13 L975 1 L990 13 L1005 1 L1020 13 L1035 1 L1050 13 L1065 1 L1080 13 L1095 1 L1110 13 L1125 1 L1140 13 L1155 1 L1170 13 L1185 1 L1200 7"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {foldLabel && (
          <div className="absolute left-1/2 -translate-x-1/2 bg-[#F4EBDD] px-4 py-0.5 flex items-center gap-1.5 text-[11px] text-[#4A372F]/80 tracking-wide">
            <Scissors className="w-3 h-3 text-[#B98A5E] -rotate-12" />
            <span className="font-handwritten text-sm text-[#4A372F]">{foldLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
};

interface PaperTagButtonProps {
  onClick: () => void;
  label: string;
  sublabel?: string;
  variant?: 'terracotta' | 'espresso';
  className?: string;
}

export const PaperTagButton: React.FC<PaperTagButtonProps> = ({
  onClick,
  label,
  sublabel,
  variant = 'terracotta',
  className = '',
}) => {
  const bgClass =
    variant === 'terracotta'
      ? 'bg-[#C65D3B] text-[#FAF5EC] hover:bg-[#b24f2f]'
      : 'bg-[#2B1B14] text-[#FAF5EC] hover:bg-[#3d281f]';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative inline-flex items-center gap-3 pl-7 pr-6 py-3.5 clip-paper-tag ${bgClass} shadow-[0_6px_16px_rgba(43,27,20,0.2)] transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C65D3B] ${className}`}
    >
      {/* Die-cut reinforced kraft paper eyelet hole on the left */}
      <span
        aria-hidden="true"
        className="w-3.5 h-3.5 rounded-full bg-[#F4EBDD] border-[3px] border-[#B98A5E] shadow-inner shrink-0 transition-transform duration-150 group-hover:scale-110"
      />
      <span className="flex items-baseline gap-2 whitespace-nowrap">
        <span className="font-serif-display font-semibold text-sm sm:text-base tracking-tight">
          {label}
        </span>
        {sublabel && (
          <span className="font-handwritten text-base opacity-90 hidden sm:inline">
            · {sublabel}
          </span>
        )}
      </span>
      {/* Stitched dashed inner border effect */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-1.5 border border-dashed border-[#FAF5EC]/30"
      />
    </button>
  );
};
