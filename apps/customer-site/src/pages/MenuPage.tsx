import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Plus, Check, Filter, Sparkles, AlertCircle, ShoppingBag, Flame } from 'lucide-react';
import {
  MenuItem,
  MenuCategory,
  OrderItem,
  formatINR,
  CAFE_CONFIG,
} from '@atelier/shared';
import { ResilientImage, WashiTape, ZigZagFoldDivider } from '../components/PaperElements';
import { FoldableMenuCard } from '../components/FoldableMenuCard';

interface MenuPageProps {
  menuItems: MenuItem[];
  cartItems: OrderItem[];
  onAddToCart: (
    item: MenuItem,
    variantName?: string,
    addOns?: string[],
    notes?: string
  ) => void;
  onOpenCart: () => void;
}

const CATEGORIES: MenuCategory[] = [
  'Coffee',
  'Cold Drinks',
  'Bakery',
  'Breakfast',
  'Snacks',
  'Desserts',
];

export const MenuPage: React.FC<MenuPageProps> = ({
  menuItems,
  cartItems = [],
  onAddToCart,
  onOpenCart = () => {},
}) => {
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [bestsellerOnly, setBestsellerOnly] = useState(false);
  const [priceSort, setPriceSort] = useState<'default' | 'low-to-high' | 'high-to-low'>('default');
  const [unfoldedCardId, setUnfoldedCardId] = useState<string | null>(null);

  // Search input ref for quick keyboard shortcut '/'
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Customize Item Modal
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string | undefined>();
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [itemNote, setItemNote] = useState('');

  // Filtered menu list
  const filteredItems = useMemo(() => {
    return menuItems
      .filter((item) => {
        if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
        if (vegOnly && !item.isVeg) return false;
        if (bestsellerOnly && !item.tags?.includes('Bestseller')) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = item.name.toLowerCase().includes(q);
          const matchDesc = item.description.toLowerCase().includes(q);
          const matchCat = item.category.toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchCat) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (priceSort === 'low-to-high') return a.price - b.price;
        if (priceSort === 'high-to-low') return b.price - a.price;
        return 0;
      });
  }, [menuItems, selectedCategory, vegOnly, bestsellerOnly, searchQuery, priceSort]);

  const handleOpenCustomize = (item: MenuItem) => {
    if (!item.isAvailable) return;
    setCustomizingItem(item);
    setSelectedVariant(item.variants?.[0]?.name);
    setSelectedAddOns([]);
    setItemNote('');
  };

  const handleConfirmCustomize = () => {
    if (!customizingItem) return;
    onAddToCart(
      customizingItem,
      selectedVariant,
      selectedAddOns.length > 0 ? selectedAddOns : undefined,
      itemNote.trim() || undefined
    );
    setCustomizingItem(null);
  };

  const toggleAddOn = (addOnName: string) => {
    setSelectedAddOns((prev) =>
      prev.includes(addOnName) ? prev.filter((a) => a !== addOnName) : [...prev, addOnName]
    );
  };

  const getCustomizingPrice = () => {
    if (!customizingItem) return 0;
    let total = customizingItem.price;
    if (selectedVariant && customizingItem.variants) {
      const v = customizingItem.variants.find((v) => v.name === selectedVariant);
      if (v) total += v.priceDelta;
    }
    if (customizingItem.addOns) {
      selectedAddOns.forEach((addonName) => {
        const a = customizingItem.addOns?.find((ao) => ao.name === addonName);
        if (a) total += a.price;
      });
    }
    return total;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-6 pb-20">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
        <span className="text-xs text-[#4A372F] tracking-wide font-mono uppercase">
          Live Paper Ledger & Kitchen Bar
        </span>
        <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#2B1B14]">
          The Roastery Digital Menu
        </h1>
        <p className="text-xs sm:text-sm text-[#4A372F] leading-relaxed">
          Sourced direct, pulled fresh to order. Prices formatted in Indian Rupee ({CAFE_CONFIG.currencySymbol}) with 5% GST included at checkout.
        </p>
      </div>

      {/* Sticky Search & Filter Bar */}
      <div className="sticky top-[64px] z-30 bg-[#F4EBDD]/95 backdrop-blur-xs py-3 border-b border-[#B98A5E]/40 mb-8 space-y-3">
        {/* Top Filter Row: Search & Toggles */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#B98A5E] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pour-over, cortado, kouign-amann, sourdough... (press /)"
              className="w-full pl-9 pr-16 py-2 text-xs bg-[#FAF5EC] border border-[#B98A5E]/60 text-[#2B1B14] placeholder:text-[#4A372F]/60 focus:outline-none focus:border-[#C65D3B] min-h-[44px]"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-[#4A372F] hover:text-[#2B1B14] cursor-pointer px-1 py-0.5"
                >
                  Clear
                </button>
              ) : (
                <kbd
                  className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-[#E7D6BE] border border-[#B98A5E]/60 text-[#2B1B14] select-none"
                  title="Press / to focus search"
                >
                  /
                </kbd>
              )}
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Veg Only Toggle */}
            <button
              type="button"
              onClick={() => setVegOnly((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border transition-colors cursor-pointer min-h-[44px] ${
                vegOnly
                  ? 'bg-[#2E7D32] text-white border-[#2E7D32] font-semibold'
                  : 'bg-[#FAF5EC] text-[#2B1B14] border-[#B98A5E]/50 hover:border-[#2B1B14]'
              }`}
              aria-pressed={vegOnly}
            >
              <span className="w-2 h-2 rounded-full border border-current flex items-center justify-center p-0.5">
                <span className="w-1 h-1 rounded-full bg-current" />
              </span>
              <span>Veg Only</span>
            </button>

            {/* Bestseller Filter */}
            <button
              type="button"
              onClick={() => setBestsellerOnly((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border transition-colors cursor-pointer min-h-[44px] ${
                bestsellerOnly
                  ? 'bg-[#C65D3B] text-white border-[#C65D3B] font-semibold'
                  : 'bg-[#FAF5EC] text-[#2B1B14] border-[#B98A5E]/50 hover:border-[#2B1B14]'
              }`}
              aria-pressed={bestsellerOnly}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bestsellers</span>
            </button>

            {/* Price Sort Dropdown */}
            <select
              value={priceSort}
              onChange={(e) => setPriceSort(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs bg-[#FAF5EC] border border-[#B98A5E]/60 text-[#2B1B14] focus:outline-none focus:border-[#C65D3B] min-h-[44px] cursor-pointer"
              aria-label="Sort by price"
            >
              <option value="default">Default Sort</option>
              <option value="low-to-high">Price: Low to High</option>
              <option value="high-to-low">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Category Tabs with Edge Scroll Hint */}
        <div className="relative">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 pr-6">
            <button
              type="button"
              onClick={() => setSelectedCategory('All')}
              className={`px-3.5 py-1.5 text-xs font-medium whitespace-nowrap border transition-colors cursor-pointer min-h-[40px] ${
                selectedCategory === 'All'
                  ? 'bg-[#2B1B14] text-[#FAF5EC] border-[#2B1B14] shadow-xs'
                  : 'bg-[#FAF5EC] text-[#4A372F] border-[#B98A5E]/40 hover:border-[#2B1B14]'
              }`}
            >
              All Items ({menuItems.length})
            </button>
            {CATEGORIES.map((cat) => {
              const count = menuItems.filter((i) => i.category === cat).length;
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 text-xs font-medium whitespace-nowrap border transition-colors cursor-pointer min-h-[40px] ${
                    isSelected
                      ? 'bg-[#2B1B14] text-[#FAF5EC] border-[#2B1B14] shadow-xs'
                      : 'bg-[#FAF5EC] text-[#4A372F] border-[#B98A5E]/40 hover:border-[#2B1B14]'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
          <div className="pointer-events-none absolute right-0 top-0 bottom-1 w-8 bg-gradient-to-l from-[#F4EBDD] to-transparent sm:hidden" />
        </div>
      </div>

      {/* Menu Grid */}
      <h2 className="sr-only">Available Menu Offerings</h2>
      {filteredItems.length === 0 ? (
        <div className="paper-sheet paper-grain p-12 text-center border border-[#B98A5E]/40 max-w-md mx-auto my-12 space-y-3">
          <AlertCircle className="w-8 h-8 text-[#B98A5E] mx-auto" />
          <h3 className="font-serif-display text-lg font-semibold text-[#2B1B14]">
            No Items Found
          </h3>
          <p className="text-xs text-[#4A372F]">
            Try adjusting your search keywords or resetting the veg / category filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setVegOnly(false);
              setBestsellerOnly(false);
              setSelectedCategory('All');
            }}
            className="px-4 py-2 bg-[#2B1B14] text-[#FAF5EC] text-xs font-serif-display cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <FoldableMenuCard
              key={item.id}
              item={item}
              isUnfolded={unfoldedCardId === item.id}
              onToggleUnfold={(id) => setUnfoldedCardId((prev) => (prev === id ? null : id))}
              cartItems={cartItems}
              onAddToCart={onAddToCart}
              onOpenCustomize={handleOpenCustomize}
            />
          ))}
        </div>
      )}

      {/* Customize Item Modal (Variants & Add-ons) */}
      {customizingItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B1B14]/65 backdrop-blur-xs overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label={`Customize ${customizingItem.name}`}
        >
          <div className="relative w-full max-w-lg paper-sheet paper-grain p-6 sm:p-8 border border-[#B98A5E]/40 shadow-2xl max-h-[90vh] overflow-y-auto">
            <WashiTape variant="terracotta" position="top-center" label="Kitchen Customization Slip" />

            <div className="flex items-start justify-between border-b border-[#B98A5E]/40 pb-3 pt-2">
              <div>
                <span className="text-[11px] text-[#4A372F] uppercase font-mono">
                  {customizingItem.category}
                </span>
                <h3 className="font-serif-display text-xl font-bold text-[#2B1B14]">
                  {customizingItem.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCustomizingItem(null)}
                className="p-1 text-[#4A372F] hover:text-[#2B1B14]"
              >
                ✕
              </button>
            </div>

            {/* Variants Selector (e.g. Size S/M/L) */}
            {customizingItem.variants && customizingItem.variants.length > 0 && (
              <div className="py-4 border-b border-dashed border-[#B98A5E]/40">
                <span className="block text-xs font-semibold text-[#2B1B14] mb-2">
                  Select Size / Portion:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {customizingItem.variants.map((v) => (
                    <button
                      key={v.name}
                      type="button"
                      onClick={() => setSelectedVariant(v.name)}
                      className={`p-2.5 text-xs text-left border transition-colors cursor-pointer ${
                        selectedVariant === v.name
                          ? 'bg-[#2B1B14] text-[#FAF5EC] border-[#2B1B14]'
                          : 'bg-[#FAF5EC] text-[#2B1B14] border-[#B98A5E]/40 hover:border-[#2B1B14]'
                      }`}
                    >
                      <div className="font-medium">{v.name}</div>
                      <div className="text-[11px] opacity-80 tabular-nums">
                        {v.priceDelta > 0 ? `+${formatINR(v.priceDelta)}` : 'Standard'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add-ons Selector (e.g. Extra Shot, Oat Milk) */}
            {customizingItem.addOns && customizingItem.addOns.length > 0 && (
              <div className="py-4 border-b border-dashed border-[#B98A5E]/40">
                <span className="block text-xs font-semibold text-[#2B1B14] mb-2">
                  Add-Ons & Milks:
                </span>
                <div className="space-y-2">
                  {customizingItem.addOns.map((addon) => {
                    const isSelected = selectedAddOns.includes(addon.name);
                    return (
                      <label
                        key={addon.name}
                        className={`flex items-center justify-between p-2.5 text-xs border cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[#FAF5EC] border-[#C65D3B]'
                            : 'bg-[#FAF5EC] border-[#B98A5E]/40'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleAddOn(addon.name)}
                            className="text-[#C65D3B]"
                          />
                          <span className="font-medium text-[#2B1B14]">{addon.name}</span>
                        </div>
                        <span className="font-mono text-[#C65D3B] tabular-nums font-semibold">
                          +{formatINR(addon.price)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Per-Item Special Note */}
            <div className="py-4 space-y-1.5">
              <label htmlFor="custom-instructions" className="block text-xs font-medium text-[#4A372F]">
                Special Instructions for Barista / Chef:
              </label>
              <input
                id="custom-instructions"
                type="text"
                value={itemNote}
                onChange={(e) => setItemNote(e.target.value)}
                placeholder="e.g. Extra hot, warm croissant, less ice..."
                className="w-full px-3 py-2 text-xs bg-[#FAF5EC] border border-[#B98A5E]/50 text-[#2B1B14] focus:outline-none focus:border-[#C65D3B]"
              />
            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-4 border-t border-[#B98A5E]/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#4A372F] uppercase block">Item Total</span>
                <span className="font-serif-display text-xl font-bold text-[#C65D3B] tabular-nums">
                  {formatINR(getCustomizingPrice())}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCustomizingItem(null)}
                  className="px-3.5 py-2 text-xs border border-[#B98A5E]/50 text-[#4A372F] hover:bg-[#E7D6BE] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCustomize}
                  className="px-5 py-2 bg-[#C65D3B] text-[#FAF5EC] text-xs font-serif-display font-semibold hover:bg-[#b24f2f] cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add to Tray</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
