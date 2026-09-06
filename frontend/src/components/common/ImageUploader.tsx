import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

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

export default function ImageUploader({ onFilesSelected, onChange, maxFiles, maxImages, existingImages = [], onRemoveExisting }: ImageUploaderProps) {
  const handleCallback = onFilesSelected || onChange || (() => {});
  const limit = maxFiles || maxImages || 5;
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const validFiles = Array.from(files).filter(f =>
      ['image/jpeg', 'image/jpg', 'image/png'].includes(f.type)
    );
    const totalAllowed = limit - existingImages.length - previews.length;
    const newFiles = validFiles.slice(0, totalAllowed);
    const newPreviews = newFiles.map(file => ({ file, url: URL.createObjectURL(file) }));
    setPreviews(prev => [...prev, ...newPreviews]);
    handleCallback([...previews.map(p => p.file), ...newFiles]);
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
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
        <p className="text-sm font-medium text-gray-600">Drag & drop images here or click to browse</p>
        <p className="text-xs text-gray-400 mt-1">JPG, JPEG, PNG (max {maxFiles} images)</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {(existingImages.length > 0 || previews.length > 0) && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {existingImages.map((url, i) => (
            <div key={`existing-${i}`} className="relative group aspect-square rounded-lg overflow-hidden border">
              <img src={url} alt="" className="w-full h-full object-cover" />
              {onRemoveExisting && (
                <button
                  onClick={() => onRemoveExisting(url)}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
          {previews.map((preview, i) => (
            <div key={`preview-${i}`} className="relative group aspect-square rounded-lg overflow-hidden border">
              <img src={preview.url} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => removePreview(i)}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
