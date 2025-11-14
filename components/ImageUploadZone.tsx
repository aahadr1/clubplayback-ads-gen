'use client';

import { useCallback, useState } from 'react';
import { Upload, X, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface ImageUploadZoneProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export default function ImageUploadZone({
  images,
  onImagesChange,
  maxImages = 3,
}: ImageUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith('image/')
      );

      if (files.length + images.length > maxImages) {
        alert(`You can only upload up to ${maxImages} images`);
        return;
      }

      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            onImagesChange([...images, e.target.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    },
    [images, maxImages, onImagesChange]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files).filter((file) =>
      file.type.startsWith('image/')
    );

    if (fileArray.length + images.length > maxImages) {
      alert(`You can only upload up to ${maxImages} images`);
      return;
    }

    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onImagesChange([...images, e.target.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      {images.length < maxImages && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`relative border-3 border-dashed rounded-2xl p-10 transition-all duration-300 ${
            isDragging
              ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 scale-[1.02]'
              : 'border-gray-300 dark:border-dark-700 hover:border-primary-400 dark:hover:border-primary-600 bg-gray-50/50 dark:bg-dark-800/50'
          }`}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            id="image-upload"
          />
          <div className="text-center pointer-events-none">
            <motion.div
              animate={isDragging ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
              className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/40 dark:to-primary-800/40 mb-4 border-2 border-primary-200 dark:border-primary-800"
            >
              {isDragging ? (
                <ImageIcon className="w-10 h-10 text-primary-600 dark:text-primary-400" />
              ) : (
                <Upload className="w-10 h-10 text-primary-600 dark:text-primary-400" />
              )}
            </motion.div>
            <p className="text-base font-bold text-gray-900 dark:text-white mb-2">
              {isDragging ? 'Drop your images here' : 'Drop images here or click to upload'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              PNG, JPG, WebP up to 10MB
            </p>
            <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700">
              <span className="w-2 h-2 rounded-full bg-success-500"></span>
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                {maxImages - images.length} of {maxImages} remaining
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Image Grid */}
      <AnimatePresence>
        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-3 gap-4"
          >
            {images.map((img, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative aspect-square rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-dark-700 group hover:border-primary-300 dark:hover:border-primary-700 transition-all shadow-sm hover:shadow-lg"
              >
                <Image
                  src={img}
                  alt={`Upload ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                
                {/* Success Badge */}
                <div className="absolute top-3 left-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success-500 shadow-lg">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    <span className="text-xs font-semibold text-white">Ready</span>
                  </div>
                </div>

                {/* Remove Button */}
                <motion.button
                  onClick={() => removeImage(index)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute top-3 right-3 z-10 p-2 bg-red-500 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-lg shadow-red-500/50"
                >
                  <X className="w-4 h-4" />
                </motion.button>

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* Image Number */}
                <div className="absolute bottom-3 left-3 z-10">
                  <div className="px-2.5 py-1 rounded-lg bg-white/90 dark:bg-dark-900/90 backdrop-blur-sm border border-gray-200 dark:border-dark-700 shadow-sm">
                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                      #{index + 1}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

