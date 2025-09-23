import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UploadFormProps {
  onImageSelect: (file: File) => void;
  onClassify: () => void;
  selectedImage: File | null;
  isLoading: boolean;
}

export const UploadForm = ({ onImageSelect, onClassify, selectedImage, isLoading }: UploadFormProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      onImageSelect(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onImageSelect(files[0]);
    }
  };

  const clearImage = () => {
    onImageSelect(null as any);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300
          ${isDragOver 
            ? 'border-primary bg-primary/5 scale-[1.02]' 
            : 'border-muted-foreground/30 hover:border-primary/50'
          }
          ${selectedImage ? 'bg-muted/20' : 'bg-background'}
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {selectedImage ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-medium text-card-foreground">{selectedImage.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearImage}
                className="ml-auto"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="w-full h-48 bg-muted rounded-lg overflow-hidden">
              <img
                src={URL.createObjectURL(selectedImage)}
                alt="Preview"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-lg font-medium text-card-foreground mb-2">
                Upload Animal Image
              </p>
              <p className="text-muted-foreground mb-4">
                Drag and drop your cattle or buffalo image here, or click to select
              </p>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="mx-auto"
              >
                Select Image
              </Button>
            </div>
          </div>
        )}
      </div>

      {selectedImage && (
        <div className="flex justify-center">
          <Button
            onClick={onClassify}
            disabled={isLoading}
            className="px-8 py-3 text-lg font-medium"
            size="lg"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                Analyzing...
              </>
            ) : (
              'Classify Animal'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};