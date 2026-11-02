import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Search,
  Sparkles,
  AlertTriangle,
  Clock,
  Package,
  Camera,
  UploadCloud,
  Image as ImageIcon,
} from 'lucide-react';
import { MenuItem, MenuCategory } from '@atelier/shared';
import { formatINR } from '@atelier/shared';
import { cafeStore } from '@atelier/shared';
import { ResilientImage, WashiTape } from './PaperElements';
import { MenuItemImageUploader } from './MenuItemImageUploader';
import { BulkPhotoUploadModal } from './BulkPhotoUploadModal';

const CATEGORIES: MenuCategory[] = [
  'Coffee',
  'Cold Drinks',
  'Bakery',
  'Breakfast',
  'Snacks',
  'Desserts',
];

export const MenuInventoryManager: React.FC = () => {
  const [items, setItems] = useState<MenuItem[]>(() => cafeStore.getMenuItems());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('All');
  const [filterMissingPhoto, setFilterMissingPhoto] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = cafeStore.subscribe(() => {
      setItems([...cafeStore.getMenuItems()]);
    });
    return unsub;
  }, []);

  const handleToggleStock = (itemId: string, currentAvailable: boolean) => {
    cafeStore.toggleMenuItemAvailability(itemId, !currentAvailable);
  };

  const handleDeleteItem = (itemId: string) => {
    cafeStore.deleteMenuItem(itemId);
    setDeletingItemId(null);
  };

  const handleSaveItemForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    cafeStore.saveMenuItem(editingItem);
    setEditingItem(null);
    setIsAddingNew(false);
  };

  const handleStartAddNew = () => {
    const newItem: MenuItem = {
      id: `m-${Date.now()}`,
      name: '',
      category: 'Coffee',
      description: '',
      price: 240,
      isVeg: true,
      tags: ['New'],
      isAvailable: true,
      image: '',
      prepTime: '4 min',
      stockCount: 20,
    };
    setEditingItem(newItem);
    setIsAddingNew(true);
  };

  const isItemMissingPhoto = (item: MenuItem) => {
    return !item.image || item.image.trim() === '' || item.image.includes('placeholder');
  };

  const missingPhotoCount = items.filter(isItemMissingPhoto).length;

  const filtered = items.filter((i) => {
    if (selectedCat !== 'All' && i.category !== selectedCat) return false;
    if (filterMissingPhoto && !isItemMissingPhoto(i)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FAF5EC] p-4 border border-[#B98A5E]/40 shadow-xs">
        <div>
          <span className="text-xs text-[#4A372F] uppercase tracking-wider font-mono">
            Kitchen Catalog & Stocks
          </span>
          <h2 className="font-serif-display text-2xl font-semibold text-[#2B1B14] mt-0.5">
            Menu Editions & Stock Availability
          </h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsBulkUploadOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#FAF5EC] border border-[#B98A5E]/60 hover:border-[#2B1B14] text-[#2B1B14] text-xs font-semibold cursor-pointer transition-colors"
          >
            <UploadCloud className="w-3.5 h-3.5 text-[#C65D3B]" />
            <span>Bulk Upload Photos</span>
          </button>

          <button
            type="button"
            onClick={handleStartAddNew}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2B1B14] text-[#FAF5EC] text-xs font-serif-display font-semibold hover:bg-[#3d281f] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Edition</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#FAF5EC] p-3 border border-[#B98A5E]/30 text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#B98A5E]" />
          <input
            type="text"
            placeholder="Search catalog by name or origin..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#F4EBDD] border border-[#B98A5E]/50 text-[#2B1B14]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto flex-wrap">
          <button
            type="button"
            onClick={() => setFilterMissingPhoto((prev) => !prev)}
            className={`px-2.5 py-1 text-xs border font-mono flex items-center gap-1 transition-colors cursor-pointer ${
              filterMissingPhoto
                ? 'bg-[#C65D3B] text-white border-[#C65D3B] font-bold'
                : 'bg-[#FAF5EC] text-[#C65D3B] border-[#C65D3B]/40 hover:bg-[#C65D3B]/10'
            }`}
          >
            <Camera className="w-3 h-3" />
            <span>Missing Photo ({missingPhotoCount})</span>
          </button>

          <div className="h-4 w-[1px] bg-[#B98A5E]/40 mx-1 hidden sm:block" />

          <button
            type="button"
            onClick={() => setSelectedCat('All')}
            className={`px-3 py-1 border transition-colors cursor-pointer ${
              selectedCat === 'All'
                ? 'bg-[#2B1B14] text-[#FAF5EC] border-[#2B1B14]'
                : 'bg-[#FAF5EC] text-[#4A372F] border-[#B98A5E]/40'
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1 border transition-colors cursor-pointer whitespace-nowrap ${
                selectedCat === cat
                  ? 'bg-[#2B1B14] text-[#FAF5EC] border-[#2B1B14]'
                  : 'bg-[#FAF5EC] text-[#4A372F] border-[#B98A5E]/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Stacked Cards Layout (< 768px) */}
      <div className="block md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="paper-sheet p-8 text-center text-xs text-[#8C7A70] border border-dashed border-[#B98A5E]/40">
            No culinary editions found matching your search.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="paper-sheet paper-grain p-4 border border-[#B98A5E]/40 space-y-3 shadow-xs"
            >
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 bg-[#E7D6BE] overflow-hidden border border-[#B98A5E]/40 shrink-0 relative">
                  <ResilientImage
                    src={item.image || item.imageUrl}
                    thumbSrc={item.thumbUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  {isItemMissingPhoto(item) && (
                    <button
                      type="button"
                      onClick={() => setEditingItem({ ...item })}
                      className="absolute inset-x-0 bottom-0 bg-[#C65D3B] text-white text-[9px] py-0.5 text-center font-mono cursor-pointer"
                    >
                      + Photo
                    </button>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <span className="font-serif-display font-semibold text-base text-[#2B1B14] leading-tight">
                      {item.name}
                    </span>
                    <span
                      className={`inline-block w-3 h-3 border shrink-0 flex items-center justify-center p-0.5 mt-0.5 ${
                        item.isVeg ? 'border-[#2E7D32] text-[#2E7D32]' : 'border-[#C65D3B] text-[#C65D3B]'
                      }`}
                    >
                      <span className={`w-1 h-1 rounded-full ${item.isVeg ? 'bg-[#2E7D32]' : 'bg-[#C65D3B]'}`} />
                    </span>
                  </div>
                  <span className="text-[10px] text-[#B98A5E] font-mono uppercase tracking-wider block mt-0.5">
                    {item.category}
                  </span>
                  <p className="text-xs text-[#4A372F] line-clamp-2 mt-1">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-dashed border-[#B98A5E]/30 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-[#4A372F] uppercase block">Price</span>
                  <span className="font-serif-display font-bold text-base text-[#2B1B14] tabular-nums">
                    {formatINR(item.price)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleStock(item.id, item.isAvailable)}
                    className={`px-3 py-1.5 min-h-[36px] text-xs font-semibold border cursor-pointer transition-colors ${
                      item.isAvailable
                        ? 'bg-[#2E7D32] text-white border-[#2E7D32]'
                        : 'bg-[#C65D3B] text-white border-[#C65D3B]'
                    }`}
                  >
                    {item.isAvailable ? 'In Stock' : 'Sold Out (86)'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingItem({ ...item });
                      setIsAddingNew(false);
                    }}
                    className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center border border-[#B98A5E]/50 bg-[#FAF5EC] hover:bg-[#E7D6BE] text-[#2B1B14] cursor-pointer"
                    title="Edit Item Details"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {deletingItemId === item.id ? (
                    <div className="flex items-center gap-1 bg-[#FAF5EC] p-0.5 border border-[#C65D3B]">
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        className="px-2 py-1 bg-[#C65D3B] text-white text-[10px] font-bold cursor-pointer"
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingItemId(null)}
                        className="px-1.5 py-1 bg-[#E7D6BE] text-[#2B1B14] text-[10px] cursor-pointer"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDeletingItemId(item.id)}
                      className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center border border-[#C65D3B]/40 bg-[#FAF5EC] text-[#C65D3B] hover:bg-[#C65D3B]/10 cursor-pointer"
                      title="Delete Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Menu Items Table (Desktop/Tablet) */}
      <div className="hidden md:block paper-sheet border border-[#B98A5E]/40 overflow-hidden shadow-xs">
        <div className="overflow-x-auto max-h-[640px] scrollbar-thin">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 z-10 bg-[#E7D6BE] border-b border-[#B98A5E]/40 text-[#4A372F] uppercase tracking-wider text-[10px] shadow-xs">
              <tr>
                <th className="p-3">Item Edition</th>
                <th className="p-3">Category</th>
                <th className="p-3">Type</th>
                <th className="p-3 text-right">Price</th>
                <th className="p-3 text-center">In Stock Today</th>
                <th className="p-3 text-center">Batch Stock</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#B98A5E]/20 text-[#2B1B14]">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[#FAF5EC]/70">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#E7D6BE] overflow-hidden border border-[#B98A5E]/30 shrink-0 relative">
                        <ResilientImage
                          src={item.image || item.imageUrl}
                          thumbSrc={item.thumbUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                        {isItemMissingPhoto(item) && (
                          <button
                            type="button"
                            onClick={() => setEditingItem({ ...item })}
                            className="absolute inset-x-0 bottom-0 bg-[#C65D3B] text-white text-[9px] py-0.5 text-center font-mono hover:bg-[#a84424] cursor-pointer"
                          >
                            + Photo
                          </button>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-serif-display font-semibold text-sm text-[#2B1B14]">
                            {item.name}
                          </span>
                          {isItemMissingPhoto(item) && (
                            <span className="text-[10px] text-[#C65D3B] bg-[#C65D3B]/10 px-1.5 py-0.5 rounded font-mono border border-[#C65D3B]/30">
                              Missing photo
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#4A372F] line-clamp-1">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">{item.category}</td>
                  <td className="p-3">
                    <span
                      className={`inline-block w-3 h-3 border flex items-center justify-center p-0.5 ${
                        item.isVeg ? 'border-[#2E7D32] text-[#2E7D32]' : 'border-[#C65D3B] text-[#C65D3B]'
                      }`}
                    >
                      <span className={`w-1 h-1 rounded-full ${item.isVeg ? 'bg-[#2E7D32]' : 'bg-[#C65D3B]'}`} />
                    </span>
                  </td>
                  <td className="p-3 text-right tabular-nums font-semibold text-sm">
                    {formatINR(item.price)}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleStock(item.id, item.isAvailable)}
                      className={`px-3 py-1 text-[11px] font-semibold border cursor-pointer transition-colors ${
                        item.isAvailable
                          ? 'bg-[#2E7D32] text-white border-[#2E7D32]'
                          : 'bg-[#C65D3B] text-white border-[#C65D3B]'
                      }`}
                    >
                      {item.isAvailable ? 'In Stock (Live)' : 'Sold Out'}
                    </button>
                  </td>
                  <td className="p-3 text-center tabular-nums">
                    {item.stockCount !== undefined ? `${item.stockCount} left` : 'Fresh Batch'}
                  </td>
                  <td className="p-3 text-right space-x-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingItem({ ...item });
                        setIsAddingNew(false);
                      }}
                      className="p-1.5 border border-[#B98A5E]/50 bg-[#FAF5EC] hover:bg-[#E7D6BE] text-[#2B1B14] cursor-pointer"
                      title="Edit Item Details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {deletingItemId === item.id ? (
                      <span className="inline-flex items-center gap-1 bg-[#FAF5EC] p-0.5 border border-[#C65D3B]">
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item.id)}
                          className="px-2 py-0.5 bg-[#C65D3B] text-white text-[10px] font-bold cursor-pointer"
                        >
                          Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingItemId(null)}
                          className="px-1.5 py-0.5 bg-[#E7D6BE] text-[#2B1B14] text-[10px] cursor-pointer"
                        >
                          No
                        </button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeletingItemId(item.id)}
                        className="p-1.5 border border-[#C65D3B]/40 bg-[#FAF5EC] text-[#C65D3B] hover:bg-[#C65D3B]/10 cursor-pointer"
                        title="Delete Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Add Item Modal with MenuItemImageUploader */}
      {editingItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B1B14]/65 backdrop-blur-xs overflow-y-auto"
          role="dialog"
        >
          <div className="relative w-full max-w-lg paper-sheet paper-grain p-6 sm:p-8 my-8 border border-[#B98A5E]/40 shadow-2xl">
            <WashiTape variant="terracotta" position="top-center" label="Kitchen Registry" />

            <div className="flex items-start justify-between border-b border-[#B98A5E]/30 pb-3">
              <h3 className="font-serif-display text-xl font-semibold text-[#2B1B14]">
                {isAddingNew ? 'Create New Culinary Edition' : `Edit ${editingItem.name}`}
              </h3>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="p-1 text-[#4A372F] hover:text-[#2B1B14] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItemForm} className="py-4 space-y-3.5 text-xs">
              {/* Image Uploader */}
              <MenuItemImageUploader
                itemId={editingItem.id}
                currentImageUrl={editingItem.image || editingItem.imageUrl}
                currentThumbUrl={editingItem.thumbUrl}
                onImageChange={(urls) => {
                  setEditingItem({
                    ...editingItem,
                    image: urls?.imageUrl || '',
                    imageUrl: urls?.imageUrl,
                    thumbUrl: urls?.thumbUrl,
                  });
                }}
              />

              <div>
                <label className="block text-[11px] text-[#4A372F] mb-1">Edition Name *</label>
                <input
                  type="text"
                  required
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  placeholder="e.g. Cardamom & Burnt Honey Cortado"
                  className="w-full px-3 py-2 bg-[#FAF5EC] border border-[#B98A5E]/60 text-[#2B1B14]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-[#4A372F] mb-1">Category *</label>
                  <select
                    value={editingItem.category}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, category: e.target.value as MenuCategory })
                    }
                    className="w-full px-3 py-2 bg-[#FAF5EC] border border-[#B98A5E]/60 text-[#2B1B14]"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-[#4A372F] mb-1">Price in INR (₹) *</label>
                  <input
                    type="number"
                    required
                    value={editingItem.price}
                    onChange={(e) => setEditingItem({ ...editingItem, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#FAF5EC] border border-[#B98A5E]/60 text-[#2B1B14] tabular-nums font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-[#4A372F] mb-1">Description *</label>
                <textarea
                  rows={2}
                  required
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF5EC] border border-[#B98A5E]/60 text-[#2B1B14]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-[#4A372F] mb-1">Prep Time</label>
                  <input
                    type="text"
                    value={editingItem.prepTime}
                    onChange={(e) => setEditingItem({ ...editingItem, prepTime: e.target.value })}
                    placeholder="e.g. 4 min"
                    className="w-full px-3 py-2 bg-[#FAF5EC] border border-[#B98A5E]/60 text-[#2B1B14]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#4A372F] mb-1">Stock Left</label>
                  <input
                    type="number"
                    value={editingItem.stockCount || 20}
                    onChange={(e) => setEditingItem({ ...editingItem, stockCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#FAF5EC] border border-[#B98A5E]/60 text-[#2B1B14] tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-[#4A372F] mb-1">Dietary Spec</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="diet"
                      checked={editingItem.isVeg}
                      onChange={() => setEditingItem({ ...editingItem, isVeg: true })}
                      className="text-[#2E7D32]"
                    />
                    <span>100% Vegetarian</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="diet"
                      checked={!editingItem.isVeg}
                      onChange={() => setEditingItem({ ...editingItem, isVeg: false })}
                      className="text-[#C65D3B]"
                    />
                    <span>Contains Egg / Non-Veg</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-[#B98A5E]/30 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-3 py-1.5 text-xs text-[#4A372F] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C65D3B] text-white text-xs font-serif-display font-semibold cursor-pointer hover:bg-[#b04a29] transition-colors"
                >
                  Save Edition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Photo Upload Modal */}
      <BulkPhotoUploadModal
        isOpen={isBulkUploadOpen}
        onClose={() => setIsBulkUploadOpen(false)}
        menuItems={items}
        onUploadSuccess={() => setItems([...cafeStore.getMenuItems()])}
      />
    </div>
  );
};
