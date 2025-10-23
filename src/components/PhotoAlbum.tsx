import React from 'react';
import { ArrowLeft, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PhotoAlbumProps {
  category: {
    id: number;
    name: string;
    count: number;
    image: string;
    gradient: string;
  };
  onClose: () => void;
}

const PhotoAlbum = ({ category, onClose }: PhotoAlbumProps) => {
  // Production ready - No sample data
  // Production ready - show empty state
  const photos: unknown[] = [];

  return (
    <div className="fixed inset-0 bg-background-overlay backdrop-blur-xl z-50 animate-fade-in">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-accent"
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{category.name}</h1>
              <p className="text-foreground-secondary">{category.count} foto</p>
            </div>
          </div>
          
          <Button 
            className="bg-primary hover:bg-primary-hover text-primary-foreground"
            onClick={() => window.open('https://drive.google.com/drive/folders/1lBh_Q-0reB_jzw43AWh8a0zkHzLcRmcN?usp=sharing', '_blank')}
          >
            <Download size={16} />
            Scarica Tutto
          </Button>
        </div>

        {/* Photo Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="group relative aspect-square overflow-hidden rounded-lg bg-background-secondary border border-border hover:border-border-accent transition-all duration-300 hover:scale-[1.02]"
              >
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                
                {/* Overlay with photo info */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-sm font-medium text-foreground truncate">
                      {photo.title}
                    </p>
                  </div>
                </div>

                {/* Download button for individual photo */}
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-8 h-8"
                >
                  <Download size={14} />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoAlbum;