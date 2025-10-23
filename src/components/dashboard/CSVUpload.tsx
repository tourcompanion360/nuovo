import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileText } from 'lucide-react';

interface CSVUploadProps {
  onUpload: (file: File) => void;
  dataCount: number;
}

const CSVUpload = ({ onUpload, dataCount }: CSVUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-2 bg-glass-background border-glass-border hover:bg-accent"
      >
        <Upload size={18} />
        Importa CSV
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleUpload}
        className="hidden"
      />
      {dataCount > 0 && (
        <div className="flex items-center gap-2 px-3 py-1 bg-success/20 text-success rounded-lg text-sm">
          <FileText size={16} />
          {dataCount} righe elaborate
        </div>
      )}
    </div>
  );
};

export default CSVUpload;