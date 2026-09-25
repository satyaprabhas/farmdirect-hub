import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Camera } from 'lucide-react';
import CameraCaptureModal from './CameraCaptureModal';
import { useLanguage } from '../../context/LanguageContext';

interface ImageUploaderProps {
  onFilesSelected?: (files: File[]) => void;
  onChange?: (files: File[]) => void;
  images?: File[];
  maxFiles?: number;
  maxImages?: number;
  label?: string;
  existingImages?: string[];
  onRemoveExisting?: (url: string) => void;
}

export default function ImageUploader({ 
  onFilesSelected, 
  onChange, 
  maxFiles, 
  maxImages, 
  existingImages = [], 
  onRemoveExisting 
}: ImageUploaderProps) {
  const { language } = useLanguage();
  const handleCallback = onFilesSelected || onChange || (() => {});
  const limit = maxFiles || maxImages || 5;
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const validFiles = Array.from(files).filter(f =>
      ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(f.type)
    );
    const totalAllowed = limit - existingImages.length - previews.length;
    const newFiles = validFiles.slice(0, Math.max(0, totalAllowed));
    const newPreviews = newFiles.map(file => ({ file, url: URL.createObjectURL(file) }));
    const updatedPreviews = [...previews, ...newPreviews];
    setPreviews(updatedPreviews);
    handleCallback(updatedPreviews.map(p => p.file));
  };

  const handleCameraCapture = (file: File, dataUrl: string) => {
    const totalAllowed = limit - existingImages.length - previews.length;
    if (totalAllowed <= 0) return;
    const newPreview = { file, url: dataUrl };
    const updatedPreviews = [...previews, newPreview];
    setPreviews(updatedPreviews);
    handleCallback(updatedPreviews.map(p => p.file));
  };

  const removePreview = (index: number) => {
    setPreviews(prev => {
      const updated = prev.filter((_, i) => i !== index);
      handleCallback(updated.map(p => p.file));
      return updated;
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const remainingSlots = limit - existingImages.length - previews.length;

  return (
    <div className="space-y-4">
      {remainingSlots > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Take Photo with Camera Button */}
          <button
            type="button"
            onClick={() => setIsCameraOpen(true)}
            className="p-5 border-2 border-dashed border-emerald-400 dark:border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40 rounded-xl text-center flex flex-col items-center justify-center transition-all cursor-pointer group"
          >
            <Camera className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-200">
              {language === 'te' ? 'కెమెరాతో ఫోటో తీయండి' : 'Take Photo with Camera'}
            </p>
            <p className="text-[11px] text-emerald-700/70 dark:text-emerald-400/70 mt-0.5">
              {language === 'te' ? 'లైవ్ కెమెరా ద్వారా నేరుగా ఫోటో తీయండి' : 'Capture instant photo with device camera'}
            </p>
          </button>

          {/* Browse / Drag & Drop Box */}
          <div
            className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
              dragActive ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/20' : 'border-gray-300 dark:border-gray-600 hover:border-emerald-400 bg-gray-50/50 dark:bg-gray-800/40'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200">
              {language === 'te' ? 'డివైస్ నుండి ఎంచుకోండి' : 'Choose from Device'}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              JPG, PNG, WEBP ({remainingSlots} {language === 'te' ? 'మిగిలినవి' : 'more allowed'})
            </p>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept="image/jpeg,image/jpg,image/png,image/webp"
              capture="environment"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>
        </div>
      ) : (
        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-center text-xs text-gray-500 font-medium">
          {language === 'te' ? `గరిష్టంగా ${limit} ఫోటోలు చేర్చబడ్డాయి` : `Maximum ${limit} images reached`}
        </div>
      )}

      {/* Thumbnails preview list */}
      {(existingImages.length > 0 || previews.length > 0) && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {existingImages.map((url, i) => (
            <div key={`existing-${i}`} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
              <img 
                src={url} 
                alt="Existing produce photo" 
                onError={(e) => { (e.target as HTMLImageElement).src = '/uploads/1789360871472.jpeg'; }}
                className="w-full h-full object-cover" 
              />
              {onRemoveExisting && (
                <button
                  type="button"
                  onClick={() => onRemoveExisting(url)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}

          {previews.map((preview, i) => (
            <div key={`preview-${i}`} className="relative group aspect-square rounded-xl overflow-hidden border border-emerald-300 dark:border-emerald-700 shadow-sm">
              <img 
                src={preview.url} 
                alt="Selected produce photo" 
                onError={(e) => { (e.target as HTMLImageElement).src = '/uploads/1789360871472.jpeg'; }}
                className="w-full h-full object-cover" 
              />
              <button
                type="button"
                onClick={() => removePreview(i)}
                className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                title="Remove image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
        title={language === 'te' ? 'పంట ఉత్పత్తుల ఫోటో తీయండి' : 'Capture Produce Photo with Camera'}
      />
    </div>
  );
}
