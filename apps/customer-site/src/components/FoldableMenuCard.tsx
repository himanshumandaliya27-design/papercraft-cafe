import React, { useRef, useEffect } from 'react';
import { Plus, Check, RotateCw, X, Sparkles, Clock, Compass, Layers, Coffee } from 'lucide-react';
import { MenuItem, OrderItem, formatINR } from '@atelier/shared';
import { ResilientImage, WashiTape } from './PaperElements';

interface FoldableMenuCardProps {
  item: MenuItem;
  isUnfolded: boolean;
  onToggleUnfold: (itemId: string) => void;
  cartItems: OrderItem[];
  onAddToCart: (item: MenuItem, variantName?: string, addOns?: string[], notes?: string) => void;
  onOpenCustomize: (item: MenuItem) => void;
}

export const FoldableMenuCard: React.FC<FoldableMenuCardProps> = ({
  item,
  isUnfolded,
  onToggleUnfold,
  cartItems,
  onAddToCart,
  onOpenCustomize,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const hasVariants = Boolean(item.variants && item.variants.length > 0);
  const hasAddOns = Boolean(item.addOns && item.addOns.length > 0);
  const inCartCount = cartItems
    .filter((c) => c.menuItemId === item.id)
    .reduce((acc, c) => acc + c.quantity, 0);

  // Keyboard shortcut: Escape folds back
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isUnfolded) {
        onToggleUnfold(item.id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isUnfolded, item.id, onToggleUnfold]);

  const handleCardClick = (e: React.MouseEvent) => {
    // Avoid folding if user clicks on specific interactive button inside
    const target = e.target as HTMLElement;
    if (target.closest('button[data-interactive="true"]') || target.closest('input')) {
      return;
    }
    onToggleUnfold(item.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const target = e.target as HTMLElement;
      if (target.tagName !== 'BUTTON') {
        e.preventDefault();
        onToggleUnfold(item.id);
      }
    }
  };

  return (
    <div
      ref={cardRef}
      className={`relative w-full perspective-1200 transition-all duration-300 ${
        !item.isAvailable ? 'opacity-75' : ''
      }`}
      style={{ minHeight: '380px' }}
    >
      {/* 3D Flipper Container with Grid Stacking */}
      <div
        className={`w-full h-full grid grid-cols-1 grid-rows-1 preserve-3d transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
          isUnfolded ? 'rotate-y-180' : ''
        }`}
      >
        {/* =========================================================================
            FRONT FACE: ARTISANAL CARD WITH PHOTOGRAPHY & RECIPE SNAPSHOT
            ========================================================================= */}
        <article
          onClick={handleCardClick}
          className={`col-start-1 row-start-1 w-full h-full paper-sheet paper-grain p-4 sm:p-5 flex flex-col justify-between border border-[#B98A5E]/40 shadow-xs hover:shadow-md transition-shadow cursor-pointer select-none backface-hidden ${
            isUnfolded ? 'pointer-events-none' : ''
          }`}
          aria-hidden={isUnfolded}
        >
          <div>
            {/* Photography with Aspect Ratio */}
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#E7D6BE] border border-[#B98A5E]/30 mb-3.5">
              {item.image && (
                <ResilientImage
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              )}

              {/* Veg / Non-Veg Indicator Stamp */}
              <div className="absolute top-2 left-2 bg-[#FAF5EC]/95 backdrop-blur-xs px-2 py-0.5 text-[10px] font-semibold border border-[#B98A5E]/60 flex items-center gap-1.5 shadow-xs">
                <span
                  className={`w-2 h-2 rounded-full border ${
                    item.isVeg ? 'border-[#206324] bg-[#206324]' : 'border-[#B84B29] bg-[#B84B29]'
                  }`}
                  aria-hidden="true"
                />
                <span className="text-[#2B1B14]">{item.isVeg ? 'Veg' : 'Non-Veg'}</span>
              </div>

              {/* Tag / Bestseller Badge */}
              {item.tags && item.tags.length > 0 && (
                <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider bg-[#2B1B14] text-[#FAF5EC] border border-[#FAF5EC]/30 shadow-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* 3D Fold Hint Icon Tab */}
              <div
                className="absolute bottom-2 right-2 px-2 py-1 bg-[#FAF5EC]/90 text-[10px] font-medium text-[#2B1B14] border border-[#B98A5E]/50 shadow-xs flex items-center gap-1 hover:bg-[#FAF5EC] transition-colors"
                title="Tap to unfold recipe dossier"
              >
                <RotateCw className="w-3 h-3 text-[#B84B29]" />
                <span className="hidden sm:inline">Unfold</span>
              </div>
            </div>

            {/* Quiet Unboxed Metadata: Category · Prep Time */}
            <div className="flex items-center gap-1.5 text-[11px] text-[#4A372F] mb-1">
              <span>{item.category}</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#8A5E35]" aria-hidden="true" />
                {item.prepTime}
              </span>
            </div>

            {/* Item Title & Price */}
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <h3 className="font-serif-display text-base font-bold text-[#2B1B14] leading-snug text-balance">
                {item.name}
              </h3>
              <span className="font-mono tabular-nums text-sm font-semibold text-[#2B1B14] shrink-0">
                {formatINR(item.price)}
              </span>
            </div>

            {/* Description (2-line clamp) */}
            <p className="text-xs text-[#4A372F] line-clamp-2 leading-relaxed text-pretty mb-3">
              {item.description}
            </p>
          </div>

          {/* Action Row */}
          <div className="pt-3 border-t border-[#B98A5E]/20 flex items-center justify-between gap-2 mt-auto">
            <button
              type="button"
              data-interactive="true"
              onClick={(e) => {
                e.stopPropagation();
                onToggleUnfold(item.id);
              }}
              className="text-xs text-[#B84B29] hover:text-[#2B1B14] font-medium flex items-center gap-1 py-1 cursor-pointer transition-colors"
              aria-label={`Unfold recipe details for ${item.name}`}
            >
              <span>Recipe Dossier</span>
              <span aria-hidden="true">→</span>
            </button>

            {item.isAvailable ? (
              <div className="flex items-center gap-1.5">
                {inCartCount > 0 && (
                  <span
                    className="px-2 py-1 text-xs font-mono font-bold bg-[#FAF5EC] border border-[#2B1B14] text-[#2B1B14]"
                    title="Quantity in order tray"
                  >
                    {inCartCount} in Tray
                  </span>
                )}
                {hasVariants || hasAddOns ? (
                  <button
                    type="button"
                    data-interactive="true"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenCustomize(item);
                    }}
                    className="px-3 py-1.5 bg-[#FAF5EC] hover:bg-[#2B1B14] text-[#2B1B14] hover:text-[#FAF5EC] border border-[#2B1B14] text-xs font-medium cursor-pointer transition-colors flex items-center gap-1 min-h-[44px]"
                  >
                    <span>Customize</span>
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    data-interactive="true"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart(item);
                    }}
                    className="px-3.5 py-1.5 bg-[#2B1B14] hover:bg-[#B84B29] text-[#FAF5EC] text-xs font-medium cursor-pointer transition-colors flex items-center gap-1 min-h-[44px]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                )}
              </div>
            ) : (
              <span className="text-xs font-serif-display text-[#A32A2A] italic">
                Sold Out (86'd)
              </span>
            )}
          </div>
        </article>

        {/* =========================================================================
            BACK FACE: UNFOLDED RECIPE DOSSIER WITH COMPLETE INGREDIENTS & LOG
            ========================================================================= */}
        <div
          className={`col-start-1 row-start-1 w-full h-full paper-sheet-kraft paper-grain p-4 sm:p-5 flex flex-col justify-between border-2 border-[#B98A5E] shadow-md backface-hidden rotate-y-180 relative ${
            !isUnfolded ? 'pointer-events-none' : ''
          }`}
          aria-hidden={!isUnfolded}
        >
          {/* Paper Fold Crease Center Spine */}
          <div className="absolute top-0 bottom-0 left-1/2 w-4 -translate-x-1/2 paper-crease-vertical pointer-events-none opacity-40" />

          {/* Top Bar with Washi Tape & Close Control */}
          <div className="flex items-center justify-between pb-2 border-b border-[#B98A5E]/40 mb-3 relative z-10">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#B84B29]" aria-hidden="true" />
              <span className="text-[11px] font-mono tracking-wider text-[#2B1B14] uppercase font-semibold">
                Recipe Dossier · Batch #{item.id}
              </span>
            </div>

            <button
              type="button"
              data-interactive="true"
              onClick={() => onToggleUnfold(item.id)}
              className="p-1 hover:bg-[#FAF5EC] text-[#2B1B14] border border-[#B98A5E]/50 rounded-xs transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
              aria-label="Fold recipe dossier back to photo view"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Dossier Body */}
          <div className="space-y-2.5 overflow-y-auto max-h-[250px] pr-1 scrollbar-thin relative z-10 text-left">
            <div>
              <h4 className="font-serif-display text-base font-bold text-[#2B1B14] leading-snug">
                {item.name}
              </h4>
              <p className="text-xs text-[#2B1B14] leading-relaxed mt-1">
                {item.description}
              </p>
            </div>

            {/* Terroir / Origin Notes */}
            {item.originNotes && (
              <div className="p-2.5 bg-[#FAF5EC]/90 border border-[#B98A5E]/40 text-xs text-[#2B1B14] space-y-1">
                <div className="flex items-center gap-1 font-semibold text-[#8A5E35] text-[10px] uppercase tracking-wider">
                  <Compass className="w-3 h-3" />
                  <span>Terroir & Artisan Notes</span>
                </div>
                <p className="font-serif-display text-xs italic">{item.originNotes}</p>
              </div>
            )}

            {/* Dietary & Customization Variants */}
            {hasVariants && (
              <div className="text-xs">
                <span className="font-semibold text-[#2B1B14] block mb-1">
                  Available Editions:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {item.variants?.map((v) => (
                    <span
                      key={v.name}
                      className="px-2 py-0.5 bg-[#FAF5EC] border border-[#B98A5E]/50 text-[11px] text-[#2B1B14]"
                    >
                      {v.name} ({v.priceDelta > 0 ? `+${formatINR(v.priceDelta)}` : 'Standard'})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Add-ons Available */}
            {hasAddOns && (
              <div className="text-xs">
                <span className="font-semibold text-[#2B1B14] block mb-1">
                  Artisan Add-ons:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {item.addOns?.map((a) => (
                    <span
                      key={a.name}
                      className="px-2 py-0.5 bg-[#FAF5EC] border border-[#B98A5E]/50 text-[11px] text-[#2B1B14]"
                    >
                      {a.name} (+{formatINR(a.price)})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Fold Action Bar */}
          <div className="pt-3 border-t border-[#B98A5E]/40 flex items-center justify-between gap-2 mt-auto relative z-10">
            <button
              type="button"
              data-interactive="true"
              onClick={() => onToggleUnfold(item.id)}
              className="text-xs text-[#2B1B14] hover:text-[#B84B29] font-medium py-1 cursor-pointer flex items-center gap-1 min-h-[44px]"
            >
              <span aria-hidden="true">←</span>
              <span>Fold Back</span>
            </button>

            {item.isAvailable && (
              <button
                type="button"
                data-interactive="true"
                onClick={() => {
                  if (hasVariants || hasAddOns) {
                    onOpenCustomize(item);
                  } else {
                    onAddToCart(item);
                  }
                }}
                className="px-4 py-2 bg-[#2B1B14] hover:bg-[#B84B29] text-[#FAF5EC] text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs min-h-[44px]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>
                  {hasVariants || hasAddOns ? 'Customize & Order' : `Add ${formatINR(item.price)}`}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
