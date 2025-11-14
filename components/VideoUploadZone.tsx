'use client';

import { useCallback, useState } from 'react';
import { Upload, X, Film } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoUploadZoneProps {
  video: string | null;
  onVideoChange: (video: string | null, file: File | null) => void;
  maxSizeMB?: number;
}

export default function VideoUploadZone({
  video,
  onVideoChange,
  maxSizeMB = 500,
}: VideoUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith('video/')
      );

      if (files.length === 0) {
        alert('Please upload a video file');
        return;
      }

      const file = files[0];
      const fileSizeMB = file.size / (1024 * 1024);

      if (fileSizeMB > maxSizeMB) {
        alert(`File size must be less than ${maxSizeMB}MB`);
        return;
      }

      const reader = new FileReader();
      reader.onloadstart = () => setUploadProgress(0);
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          setUploadProgress((e.loaded / e.total) * 100);
        }
      };
      reader.onload = (e) => {
        if (e.target?.result) {
          onVideoChange(e.target.result as string, file);
          setUploadProgress(100);
        }
      };
      reader.readAsDataURL(file);
    },
    [maxSizeMB, onVideoChange]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    if (!file.type.startsWith('video/')) {
      alert('Please upload a video file');
      return;
    }

    const fileSizeMB = file.size / (1024 * 1024);

    if (fileSizeMB > maxSizeMB) {
      alert(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    const reader = new FileReader();
    reader.onloadstart = () => setUploadProgress(0);
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        setUploadProgress((e.loaded / e.total) * 100);
      }
    };
    reader.onload = (e) => {
      if (e.target?.result) {
        onVideoChange(e.target.result as string, file);
        setUploadProgress(100);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeVideo = () => {
    onVideoChange(null, null);
    setUploadProgress(0);
  };

  return (
    <div className="space-y-4">
      {!video && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg p-8 transition-all ${
            isDragging
              ? 'border-primary-600 bg-primary-600/5'
              : 'border-dark-800 hover:border-primary-900/50'
          }`}
        >
          <input
            type="file"
            accept="video/*"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            id="video-upload"
          />
          <div className="text-center pointer-events-none">
            <Upload className="w-10 h-10 mx-auto mb-4 text-gray-500" />
            <p className="text-sm font-medium text-white mb-1">
              Drop video here or click to upload
            </p>
            <p className="text-xs text-gray-500">
              MP4, WebM, MOV up to {maxSizeMB}MB
            </p>
          </div>
        </motion.div>
      )}

      {uploadProgress > 0 && uploadProgress < 100 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card"
        >
          <div className="flex items-center gap-3">
            <Film className="w-5 h-5 text-primary-400" />
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-300">Uploading...</span>
                <span className="text-sm text-gray-400">
                  {Math.round(uploadProgress)}%
                </span>
              </div>
              <div className="w-full bg-dark-800 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {video && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className="relative rounded-lg overflow-hidden border border-dark-800 group"
          >
            <video
              src={video}
              controls
              className="w-full h-auto max-h-[400px] bg-black"
            />
            <button
              onClick={removeVideo}
              className="absolute top-4 right-4 p-2 bg-black/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

