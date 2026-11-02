import React, { useState, useRef } from 'react';
import { UploadCloud, Camera, RefreshCw, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { processAndCropImage, uploadMenuItemPhoto, ProcessedImageResult } from '@atelier/shared';

interface MenuItemImageUploaderProps {
  itemId: string;
  currentImageUrl?: string;
  currentThumbUrl?: string;
  onImageChange: (urls: { imageUrl: string; thumbUrl: string } | null) => void;
}

export const MenuItemImageUploader: React.FC<MenuItemImageUploaderProps> = ({
  itemId,
  currentImageUrl,
  currentThumbUrl,
  onImageChange,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelection = async (file: File) => {
    setErrorMessage(null);
    setIsProcessing(true);
    setProgressPercent(10);
    setProgressStatus('Reading image...');

    try {
      const processed: ProcessedImageResult = await processAndCropImage(file, 4 / 3);
      setPreviewUrl(processed.fullDataUrl);
      setProgressPercent(40);
      setProgressStatus('Compressing WebP (1200px & 400px thumb)...');

      const uploaded = await uploadMenuItemPhoto(itemId, processed, (pct, status) => {
        setProgressPercent(pct);
        setProgressStatus(status);
      });

      onImageChange({
        imageUrl: uploaded.imageUrl,
        thumbUrl: uploaded.thumbUrl,
      });
      setPreviewUrl(uploaded.imageUrl);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to process or upload image.');
    } finally {
      setIsProcessing(false);
      setProgressPercent(0);
      setProgressStatus('');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setErrorMessage(null);
    onImageChange(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-semibold text-[#4A372F] uppercase tracking-wider font-mono">
        Menu Photography (4:3 Frame)
      </label>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) handleFileSelection(e.target.files[0]);
        }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) handleFileSelection(e.target.files[0]);
        }}
      />

      {previewUrl ? (
        <div className="relative border-2 border-[#B98A5E]/60 bg-[#FAF5EC] overflow-hidden rounded-xs shadow-xs">
          {/* 4:3 Aspect Ratio Preview Box */}
          <div className="aspect-[4/3] w-full bg-[#EFE4D2] relative">
            <img
              src={previewUrl}
              alt="Menu item preview"
              className="w-full h-full object-cover"
            />
            {isProcessing && (
              <div className="absolute inset-0 bg-[#2B1B14]/70 flex flex-col items-center justify-center p-4 text-white">
                <RefreshCw className="w-6 h-6 animate-spin text-[#E5B358] mb-2" />
                <span className="text-xs font-mono font-medium">{progressStatus}</span>
                <div className="w-48 bg-white/20 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-[#E5B358] h-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="p-2.5 bg-[#FAF5EC] border-t border-[#B98A5E]/40 flex items-center justify-between">
            <span className="text-[10px] text-[#2E7D32] flex items-center gap-1 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" />
              4:3 WebP Ready
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="px-2.5 py-1 bg-[#2B1B14] hover:bg-[#4A372F] text-white text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Replace
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={isProcessing}
                className="px-2.5 py-1 bg-[#C65D3B]/10 hover:bg-[#C65D3B]/20 text-[#C65D3B] border border-[#C65D3B]/40 text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty / Drag & Drop Dropzone */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed p-6 text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-[#C65D3B] bg-[#C65D3B]/10'
              : 'border-[#B98A5E]/60 bg-[#FAF5EC] hover:border-[#2B1B14]'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center py-2 space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin text-[#C65D3B]" />
              <span className="text-xs font-mono text-[#2B1B14] font-medium">{progressStatus}</span>
              <div className="w-48 bg-[#B98A5E]/30 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#C65D3B] h-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-full bg-[#EFE4D2] border border-[#B98A5E]/50 flex items-center justify-center mx-auto text-[#C65D3B]">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-serif font-bold text-[#2B1B14]">
                  Drop menu photograph here, or <span className="text-[#C65D3B] underline">browse</span>
                </p>
                <p className="text-[10px] text-[#6B5A4E] mt-0.5 font-mono">
                  JPG, PNG, or WebP · Max 5 MB · Auto-cropped to 4:3 landscape
                </p>
              </div>

              <div className="pt-1 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    cameraInputRef.current?.click();
                  }}
                  className="px-2.5 py-1 bg-[#E7D6BE] hover:bg-[#D9C4A6] text-[#2B1B14] text-[11px] font-medium flex items-center gap-1 border border-[#B98A5E]/50 cursor-pointer"
                >
                  <Camera className="w-3 h-3 text-[#C65D3B]" />
                  Take Photo (Mobile)
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Callout */}
      {errorMessage && (
        <div className="p-2 bg-[#FAF5EC] border-l-3 border-[#C65D3B] text-[11px] text-[#C65D3B] flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
