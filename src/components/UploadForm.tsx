import React, { useRef, useState, DragEvent } from 'react';
import { Upload, Image, X, Loader2 } from 'lucide-react';

interface UploadFormProps {
  selectedFile: File | null;
  onFileSelect: (file: File) => void;
  onClassify: () => void;
  isLoading: boolean;
  onReset: () => void;
}

const UploadForm: React.FC<UploadFormProps> = ({
  selectedFile,
  onFileSelect,
  onClassify,
  isLoading,
  onReset
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        onFileSelect(file);
      } else {
        alert('Please select an image file (JPG, PNG, etc.)');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-slate-800 mb-2">
          Upload Livestock Image
        </h2>
        <p className="text-slate-600">
          Upload a clear image of cattle or buffalo for AI-powered classification and scoring
        </p>
      </div>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 ${
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : selectedFile
            ? 'border-green-400 bg-green-50'
            : 'border-slate-300 bg-slate-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleUploadClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {selectedFile ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <Image className="h-12 w-12 text-green-500" />
            </div>
            <div>
              <p className="text-lg font-medium text-green-700">
                {selectedFile.name}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onReset();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              <X className="h-4 w-4" />
              Remove
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <Upload className={`h-12 w-12 ${isDragOver ? 'text-blue-500' : 'text-slate-400'}`} />
            </div>
            <div>
              <p className="text-lg font-medium text-slate-700">
                Drop your image here, or click to browse
              </p>
              <p className="text-sm text-slate-500 mt-2">
                Supports JPG, PNG, WEBP up to 10MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Classify Button */}
      <div className="flex justify-center">
        <button
          onClick={onClassify}
          disabled={!selectedFile || isLoading}
          className={`inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white transition-all duration-200 ${
            !selectedFile || isLoading
              ? 'bg-slate-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 hover:scale-105 shadow-lg hover:shadow-xl'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Classifying...
            </>
          ) : (
            <>
              <Image className="h-5 w-5" />
              Classify Image
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default UploadForm;