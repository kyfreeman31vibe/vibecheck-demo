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
    
    console.log('=== FILE UPLOAD STARTED ===');
    console.log('Files selected:', files.length);
    console.log('Current photos in component:', photos.length);
    console.log('Max photos allowed:', maxPhotos);
    console.log('File details:', files.map(f => ({
      name: f.name,
      size: f.size,
      type: f.type,
      sizeInMB: (f.size / (1024 * 1024)).toFixed(2)
    })));
    
    if (photos.length + files.length > maxPhotos) {
      toast({
        title: "Too many photos",
        description: `You can only upload up to ${maxPhotos} photos. You currently have ${photos.length} photos.`,
        variant: "destructive",
      });
      return;
    }

    // Check individual file sizes before processing
    const oversizedFiles = files.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast({
        title: "File too large",
        description: `Some files are over 10MB: ${oversizedFiles.map(f => f.name).join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    try {
      console.log('Starting file conversion to base64...');
      const newPhotos = await Promise.all(
        files.map(async (file, index) => {
          console.log(`Converting file ${index + 1}/${files.length}: ${file.name}`);
          const result = await convertFileToBase64(file);
          console.log(`File ${index + 1} converted successfully, size: ${(result.length / 1024).toFixed(2)}KB`);
          return result;
        })
      );
      
      console.log('=== PHOTO UPLOAD SUCCESS ===');
      console.log('New photos added:', newPhotos.length);
      console.log('Current photos in component:', photos.length);
      console.log('Total photos after upload:', [...photos, ...newPhotos].length);
      console.log('Base64 data sizes:', newPhotos.map(p => `${(p.length / 1024).toFixed(2)}KB`));
      console.log('=== CALLING onPhotosChange ===');
      
      const updatedPhotos = [...photos, ...newPhotos];
      console.log('Updated photos array:', updatedPhotos.length);
      onPhotosChange(updatedPhotos);
      
      toast({
        title: "Photos uploaded",
        description: `${files.length} photo(s) added successfully`,
      });
    } catch (error) {
      console.error('Photo upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload photos. Please try again.",
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
      console.log(`Converting file: ${file.name}, size: ${(file.size / (1024 * 1024)).toFixed(2)}MB, type: ${file.type}`);
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        console.error(`Invalid file type: ${file.type} for file: ${file.name}`);
        reject(new Error(`"${file.name}" is not an image file. Please select JPG, PNG, or GIF files.`));
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        console.error(`File too large: ${file.name} is ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
        reject(new Error(`"${file.name}" is ${(file.size / (1024 * 1024)).toFixed(2)}MB. Maximum size is 10MB.`));
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        console.log(`Successfully converted ${file.name} to base64, result size: ${(result.length / 1024).toFixed(2)}KB`);
        resolve(result);
      };
      reader.onerror = (error) => {
        console.error(`Failed to read file ${file.name}:`, error);
        reject(new Error(`Failed to read "${file.name}". Please try again.`));
      };
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
            Debug: {photos.length} photos loaded. Total size: {(photos.reduce((sum, photo) => sum + photo.length, 0) / 1024).toFixed(0)}KB
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
              onClick={() => {
                console.log('=== ADD PHOTO BUTTON CLICKED ===');
                console.log('File input ref:', fileInputRef.current);
                console.log('Current photos before click:', photos.length);
                fileInputRef.current?.click();
              }}
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
        <p>• Maximum file size: 10MB per photo</p>
        <p>• Supported formats: JPG, PNG, GIF</p>
      </div>
    </div>
  );
}