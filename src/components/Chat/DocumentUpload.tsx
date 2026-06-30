import React, { useRef, useState } from 'react';
import { Paperclip, X, FileText, Image as ImageIcon } from 'lucide-react';

interface FileData {
  name: string;
  url: string;
  type: string;
  base64: string;
}

interface DocumentUploadProps {
  onFileSelect: (file: FileData | null) => void;
  selectedFile: FileData | null;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ onFileSelect, selectedFile }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const processFile = (file: File) => {
    if (!file) return;

    // Check size limit (e.g. 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds the 5MB limit. Please choose a smaller file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = (e.target?.result as string).split(',')[1];
      const objectUrl = URL.createObjectURL(file);

      onFileSelect({
        name: file.name,
        url: objectUrl,
        type: file.type,
        base64: base64String
      });
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const clearFile = () => {
    if (selectedFile) {
      URL.revokeObjectURL(selectedFile.url);
    }
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative flex items-center transition-all ${
        dragging ? 'scale-105 border-indigo-500/50' : ''
      }`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*,application/pdf,text/plain"
        className="hidden"
        id="aira-file-upload"
      />

      {selectedFile ? (
        /* Active Attachment Chip */
        <div className="flex items-center gap-2 p-1.5 pl-3 pr-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-xs">
          {selectedFile.type.startsWith('image/') ? (
            <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
          ) : (
            <FileText className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span className="max-w-[100px] truncate font-semibold text-primary-text">
            {selectedFile.name}
          </span>
          <button
            onClick={clearFile}
            className="p-0.5 rounded hover:bg-white/10 text-primary-text/60 hover:text-rose-400 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        /* Paperclip Toggle Icon */
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-indigo-300 hover:text-cyan-300 border border-white/5 hover:border-white/10 transition-all duration-300 shadow-inner"
          title="Attach Screenshot, Image or PDF"
        >
          <Paperclip className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
