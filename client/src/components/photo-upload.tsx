import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Plus, Upload, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PhotoUploadProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
}

export default function PhotoUpload({ photos, onPhotosChange, maxPhotos = 5 }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  console.log('PhotoUpload component rendered with photos:', photos.length);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (photos.length + files.length > maxPhotos) {
      toast({
        title: "Too many photos",
        description: `You can only upload up to ${maxPhotos} photos`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    try {
      const newPhotos = await Promise.all(
        files.map(file => convertFileToBase64(file))
      );
      
      console.log('New photos added:', newPhotos.length);
      console.log('Total photos after upload:', [...photos, ...newPhotos].length);
      
      onPhotosChange([...photos, ...newPhotos]);
      
      toast({
        title: "Photos uploaded",
        description: `${files.length} photo(s) added successfully`,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload photos. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        reject(new Error('File must be an image'));
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        reject(new Error('File size must be less than 5MB'));
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
    
    toast({
      title: "Photo removed",
      description: "Photo has been removed from your profile",
    });
  };

  const reorderPhotos = (fromIndex: number, toIndex: number) => {
    const newPhotos = [...photos];
    const [moved] = newPhotos.splice(fromIndex, 1);
    newPhotos.splice(toIndex, 0, moved);
    onPhotosChange(newPhotos);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Profile Photos ({photos.length}/{maxPhotos})
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Add up to {maxPhotos} photos. Your first photo will be your main profile picture.
        </p>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Debug info */}
        {photos.length > 0 && (
          <div className="col-span-2 text-xs text-gray-500 bg-yellow-50 p-2 rounded">
            Debug: {photos.length} photos loaded. First photo preview: {photos[0]?.substring(0, 50)}...
          </div>
        )}
        
        {/* Existing Photos */}
        {photos.map((photo, index) => (
          <Card key={index} className="relative group overflow-hidden">
            <div className="aspect-square">
              <img
                src={photo}
                alt={`Profile photo ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Image failed to load:', photo.substring(0, 100));
                  e.currentTarget.style.display = 'none';
                }}
                onLoad={() => {
                  console.log('Image loaded successfully:', index);
                }}
              />
              
              {/* Primary badge for first photo */}
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                  Main
                </div>
              )}
              
              {/* Remove button */}
              <button
                onClick={() => removePhoto(index)}
                className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
              
              {/* Reorder controls */}
              {photos.length > 1 && index > 0 && (
                <button
                  onClick={() => reorderPhotos(index, index - 1)}
                  className="absolute bottom-2 left-2 bg-gray-800 bg-opacity-75 text-white rounded px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Move Left
                </button>
              )}
              
              {photos.length > 1 && index < photos.length - 1 && (
                <button
                  onClick={() => reorderPhotos(index, index + 1)}
                  className="absolute bottom-2 right-2 bg-gray-800 bg-opacity-75 text-white rounded px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Move Right
                </button>
              )}
            </div>
          </Card>
        ))}

        {/* Add Photo Button */}
        {photos.length < maxPhotos && (
          <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full aspect-square flex flex-col items-center justify-center space-y-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              {uploading ? (
                <div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full" />
              ) : (
                <>
                  <Plus className="w-8 h-8" />
                  <span className="text-sm font-medium">Add Photo</span>
                </>
              )}
            </button>
          </Card>
        )}
      </div>

      {/* Upload Button for Mobile */}
      {photos.length < maxPhotos && (
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full"
        >
          <Camera className="w-4 h-4 mr-2" />
          {uploading ? "Uploading..." : "Add Photos"}
        </Button>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Tips */}
      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p>• Your first photo will be your main profile picture</p>
        <p>• Use high-quality photos that show your face clearly</p>
        <p>• Maximum file size: 5MB per photo</p>
        <p>• Supported formats: JPG, PNG, GIF</p>
      </div>
    </div>
  );
}