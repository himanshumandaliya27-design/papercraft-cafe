/**
 * Atelier Vélin — Client-Side Image Processor & Firebase Storage Uploader
 * 
 * Capabilities:
 * - File type validation (JPG, PNG, WebP)
 * - Size limit enforcement (max 5 MB)
 * - 4:3 frame center crop
 * - Dual output generation:
 *    - Full display: max 1200px wide, WebP ~80% quality
 *    - Thumbnail: max 400px wide, WebP ~80% quality
 * - Firebase Storage upload (path: menu/{itemId}/{filename})
 * - Data URL fallback for offline / demo mode
 */

export interface ProcessedImageResult {
  fullBlob: Blob;
  thumbBlob: Blob;
  fullDataUrl: string;
  thumbDataUrl: string;
}

export interface UploadProgressCallback {
  (percent: number, status: string): void;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_RAW_BYTES = 5 * 1024 * 1024; // 5 MB

export async function processAndCropImage(
  file: File,
  targetRatio = 4 / 3
): Promise<ProcessedImageResult> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Unsupported format. Please upload JPG, PNG, or WebP images only.');
  }

  if (file.size > MAX_RAW_BYTES) {
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    throw new Error(`File size (${mb} MB) exceeds the 5 MB limit. Please select a smaller photo.`);
  }

  const bitmap = await createImageBitmap(file);
  const srcWidth = bitmap.width;
  const srcHeight = bitmap.height;

  // Calculate center crop for 4:3 ratio
  let cropWidth = srcWidth;
  let cropHeight = srcHeight;
  let cropX = 0;
  let cropY = 0;

  const currentRatio = srcWidth / srcHeight;
  if (currentRatio > targetRatio) {
    // Image is wider than 4:3 -> crop left and right
    cropWidth = Math.round(srcHeight * targetRatio);
    cropX = Math.round((srcWidth - cropWidth) / 2);
  } else {
    // Image is taller than 4:3 -> crop top and bottom
    cropHeight = Math.round(srcWidth / targetRatio);
    cropY = Math.round((srcHeight - cropHeight) / 2);
  }

  // 1. Full-size canvas (max 1200px width)
  const fullWidth = Math.min(1200, cropWidth);
  const fullHeight = Math.round(fullWidth / targetRatio);

  const fullCanvas = document.createElement('canvas');
  fullCanvas.width = fullWidth;
  fullCanvas.height = fullHeight;
  const fullCtx = fullCanvas.getContext('2d');
  if (!fullCtx) throw new Error('Canvas 2D context unavailable.');

  fullCtx.drawImage(
    bitmap,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    fullWidth,
    fullHeight
  );

  // 2. Thumbnail canvas (max 400px width)
  const thumbWidth = Math.min(400, cropWidth);
  const thumbHeight = Math.round(thumbWidth / targetRatio);

  const thumbCanvas = document.createElement('canvas');
  thumbCanvas.width = thumbWidth;
  thumbCanvas.height = thumbHeight;
  const thumbCtx = thumbCanvas.getContext('2d');
  if (!thumbCtx) throw new Error('Canvas 2D context unavailable.');

  thumbCtx.drawImage(
    bitmap,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    thumbWidth,
    thumbHeight
  );

  // Convert to WebP Blobs (or PNG fallback if browser lacks WebP canvas export)
  const fullBlob = await new Promise<Blob>((resolve, reject) => {
    fullCanvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Failed to encode full image.'))),
      'image/webp',
      0.82
    );
  });

  const thumbBlob = await new Promise<Blob>((resolve, reject) => {
    thumbCanvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Failed to encode thumbnail image.'))),
      'image/webp',
      0.8
    );
  });

  const fullDataUrl = fullCanvas.toDataURL('image/webp', 0.82);
  const thumbDataUrl = thumbCanvas.toDataURL('image/webp', 0.8);

  return {
    fullBlob,
    thumbBlob,
    fullDataUrl,
    thumbDataUrl,
  };
}

/**
 * Uploads processed blobs to Firebase Storage at menu/{itemId}/{filename}
 * Falls back to returning data URLs if Firebase Storage is not configured.
 */
export async function uploadMenuItemPhoto(
  itemId: string,
  processed: ProcessedImageResult,
  onProgress?: UploadProgressCallback
): Promise<{ imageUrl: string; thumbUrl: string }> {
  onProgress?.(20, 'Preparing compressed assets...');

  try {
    const { app, isFirebaseConfigured } = await import('../services/firebase');
    if (!isFirebaseConfigured || !app) {
      onProgress?.(100, 'Saved locally in sandbox');
      return {
        imageUrl: processed.fullDataUrl,
        thumbUrl: processed.thumbDataUrl,
      };
    }

    const { getStorage, ref, uploadBytesResumable, getDownloadURL } = await import('firebase/storage');
    const storage = getStorage(app);
    const timestamp = Date.now();

    const fullPath = `menu/${itemId}/photo_${timestamp}.webp`;
    const thumbPath = `menu/${itemId}/thumb_${timestamp}.webp`;

    const fullRef = ref(storage, fullPath);
    const thumbRef = ref(storage, thumbPath);

    onProgress?.(40, 'Uploading high-resolution WebP...');
    const fullUpload = uploadBytesResumable(fullRef, processed.fullBlob, {
      contentType: 'image/webp',
    });

    await fullUpload;
    const imageUrl = await getDownloadURL(fullRef);

    onProgress?.(80, 'Uploading thumbnail...');
    const thumbUpload = uploadBytesResumable(thumbRef, processed.thumbBlob, {
      contentType: 'image/webp',
    });

    await thumbUpload;
    const thumbUrl = await getDownloadURL(thumbRef);

    onProgress?.(100, 'Upload complete!');
    return { imageUrl, thumbUrl };
  } catch (err) {
    console.warn('[Storage] Firebase upload failed, falling back to data URL:', err);
    return {
      imageUrl: processed.fullDataUrl,
      thumbUrl: processed.thumbDataUrl,
    };
  }
}
