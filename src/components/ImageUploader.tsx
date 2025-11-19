import { useRef } from 'react';
import type { SupportedLanguage } from '../locales/config';
import { getTranslations } from '../utils/i18n';

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  language: SupportedLanguage;
  maxImages?: number;
}

export default function ImageUploader({
  images,
  onImagesChange,
  language,
  maxImages = 10,
}: ImageUploaderProps) {
  const t = getTranslations(language);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check if adding these files would exceed max
    if (images.length + files.length > maxImages) {
      alert(t.images.maxImagesExceeded.replace('{max}', maxImages.toString()));
      return;
    }

    try {
      const newImages: string[] = [];

      for (const file of files) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          alert(`${t.images.invalidFileType}: ${file.name}`);
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert(`${t.images.fileTooLarge}: ${file.name}`);
          continue;
        }

        // Convert to base64
        const base64 = await fileToBase64(file);
        newImages.push(base64);
      }

      if (newImages.length > 0) {
        onImagesChange([...images, ...newImages]);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      alert(t.images.uploadError);
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const handleAddClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-medium text-gray-700">
          {t.images.referenceImages}
          <span className="text-gray-500 text-xs ml-2">{t.images.optional}</span>
        </label>
        {images.length < maxImages && (
          <button
            type="button"
            onClick={handleAddClick}
            className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t.images.addImage}
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {images.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs text-gray-600">
            {t.images.imagesCount}: {images.length} / {maxImages}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image}
                  alt={`${t.images.referenceImage} ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border-2 border-gray-300 hover:border-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors opacity-0 group-hover:opacity-100"
                  title={t.images.removeImage}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="absolute bottom-1 left-1 px-2 py-0.5 bg-black/60 text-white text-xs rounded">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm text-gray-600 mb-2">{t.images.noImagesYet}</p>
          <button
            type="button"
            onClick={handleAddClick}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            {t.images.addFirstImage}
          </button>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-2">
        {t.images.helpText}
      </p>
    </div>
  );
}
