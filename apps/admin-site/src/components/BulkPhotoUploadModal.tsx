import React, { useState } from 'react';
import { X, UploadCloud, CheckCircle2, AlertCircle, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { MenuItem, processAndCropImage, uploadMenuItemPhoto, cafeStore } from '@atelier/shared';

interface BulkPhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
  onUploadSuccess: () => void;
}

interface MatchResult {
  file: File;
  matchedItem: MenuItem | null;
  status: 'pending' | 'processing' | 'done' | 'failed';
  error?: string;
}

export const BulkPhotoUploadModal: React.FC<BulkPhotoUploadModalProps> = ({
  isOpen,
  onClose,
  menuItems,
  onUploadSuccess,
}) => {
  const [results, setResults] = useState<MatchResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .replace(/&/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const handleFilesChosen = (files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);

    const matches: MatchResult[] = fileArray.map((file) => {
      const fileNameNoExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      const fileSlug = slugify(fileNameNoExt);

      const matched =
        menuItems.find((item) => item.id.toLowerCase() === fileSlug) ||
        menuItems.find((item) => slugify(item.name) === fileSlug) ||
        menuItems.find((item) => slugify(item.name).includes(fileSlug) || fileSlug.includes(slugify(item.name))) ||
        null;

      return {
        file,
        matchedItem: matched,
        status: 'pending',
      };
    });

    setResults(matches);
  };

  const handleManualAssign = (index: number, itemId: string) => {
    const item = menuItems.find((m) => m.id === itemId) || null;
    setResults((prev) => {
      const copy = [...prev];
      copy[index].matchedItem = item;
      return copy;
    });
  };

  const handleProcessAll = async () => {
    setIsProcessing(true);

    for (let i = 0; i < results.length; i++) {
      const row = results[i];
      if (!row.matchedItem) continue;

      setResults((prev) => {
        const copy = [...prev];
        copy[i].status = 'processing';
        return copy;
      });

      try {
        const processed = await processAndCropImage(row.file, 4 / 3);
        const uploaded = await uploadMenuItemPhoto(row.matchedItem.id, processed);

        const updatedItem = {
          ...row.matchedItem,
          image: uploaded.imageUrl,
          thumbUrl: uploaded.thumbUrl,
        };
        await cafeStore.saveMenuItem(updatedItem);

        setResults((prev) => {
          const copy = [...prev];
          copy[i].status = 'done';
          return copy;
        });
      } catch (err: any) {
        setResults((prev) => {
          const copy = [...prev];
          copy[i].status = 'failed';
          copy[i].error = err.message || 'Processing failed';
          return copy;
        });
      }
    }

    setIsProcessing(false);
    onUploadSuccess();
  };

  const matchedCount = results.filter((r) => r.matchedItem).length;
  const unmatchedCount = results.filter((r) => !r.matchedItem).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B1B14]/65 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl paper-sheet paper-grain p-6 sm:p-8 border border-[#B98A5E]/40 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#B98A5E]/30 pb-3">
          <div>
            <h3 className="font-serif-display text-xl font-bold text-[#2B1B14]">
              Bulk Food Photography Importer
            </h3>
            <p className="text-xs text-[#6B5A4E]">
              Select multiple photos named after menu items (e.g. <code className="bg-[#EFE4D2] px-1 font-mono">cortado.webp</code>).
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#4A372F] hover:text-[#2B1B14] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {results.length === 0 ? (
          <div className="border-2 border-dashed border-[#B98A5E]/60 p-8 text-center bg-[#FAF5EC]">
            <UploadCloud className="w-10 h-10 text-[#C65D3B] mx-auto mb-2" />
            <h4 className="font-serif font-bold text-sm text-[#2B1B14]">Select Multiple Image Files</h4>
            <p className="text-xs text-[#6B5A4E] mt-1 mb-4">
              JPG, PNG, or WebP files. Files will be cropped to 4:3 and compressed to WebP.
            </p>
            <label className="inline-block px-4 py-2 bg-[#2B1B14] text-[#FAF5EC] text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-[#4A372F] transition-colors">
              Choose Photos
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => handleFilesChosen(e.target.files)}
              />
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-mono bg-[#EFE4D2] p-2.5 border border-[#B98A5E]/40">
              <span className="text-[#2B1B14]">
                Total: <strong>{results.length}</strong> | Matched: <strong className="text-[#2E7D32]">{matchedCount}</strong> | Unmatched: <strong className="text-[#C65D3B]">{unmatchedCount}</strong>
              </span>
              <button
                type="button"
                onClick={() => setResults([])}
                disabled={isProcessing}
                className="text-xs text-[#C65D3B] underline cursor-pointer"
              >
                Clear All
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto border border-[#B98A5E]/40 divide-y divide-[#B98A5E]/30 bg-[#FAF5EC]">
              {results.map((row, idx) => (
                <div key={idx} className="p-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <ImageIcon className="w-4 h-4 text-[#B98A5E] shrink-0" />
                    <span className="font-mono text-[11px] truncate text-[#2B1B14]">{row.file.name}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <ArrowRight className="w-3.5 h-3.5 text-[#B98A5E]" />
                    {row.matchedItem ? (
                      <span className="bg-[#2E7D32]/10 text-[#2E7D32] px-2 py-0.5 rounded font-medium border border-[#2E7D32]/30 max-w-[180px] truncate">
                        {row.matchedItem.name}
                      </span>
                    ) : (
                      <select
                        onChange={(e) => handleManualAssign(idx, e.target.value)}
                        defaultValue=""
                        className="px-2 py-1 bg-white border border-[#C65D3B] text-[11px] text-[#2B1B14]"
                      >
                        <option value="" disabled>-- Assign Item --</option>
                        {menuItems.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    )}

                    {row.status === 'processing' && (
                      <span className="text-[10px] font-mono text-[#E5B358] animate-pulse">Uploading...</span>
                    )}
                    {row.status === 'done' && (
                      <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                    )}
                    {row.status === 'failed' && (
                      <AlertCircle className="w-4 h-4 text-[#C65D3B]" title={row.error} />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#B98A5E]/30">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="px-4 py-2 border border-[#B98A5E]/60 text-xs text-[#4A372F] hover:bg-[#E7D6BE] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProcessAll}
                disabled={isProcessing || matchedCount === 0}
                className="px-4 py-2 bg-[#2B1B14] hover:bg-[#4A372F] text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? 'Processing & Compressing...' : `Attach & Upload ${matchedCount} Photos`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
