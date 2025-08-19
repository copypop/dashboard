import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isLoading?: boolean;
  error?: string | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileUpload, 
  isLoading = false,
  error = null 
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1,
    disabled: isLoading
  });

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-8">
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all",
            isDragActive && "border-primary bg-primary/5",
            isLoading && "opacity-50 cursor-not-allowed",
            error && "border-destructive",
            !isDragActive && !error && "border-gray-300 hover:border-primary"
          )}
        >
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center space-y-4">
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-lg font-medium">Processing Excel file...</p>
              </>
            ) : (
              <>
                <div className="p-4 bg-primary/10 rounded-full">
                  <FileSpreadsheet className="h-12 w-12 text-primary" />
                </div>
                
                <div>
                  <p className="text-lg font-medium mb-1">
                    {isDragActive ? 'Drop your Excel file here' : 'Upload Dashboard Data'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Drag and drop your CAAT_Dashboard_Data_2025.xlsx file or click to browse
                  </p>
                </div>
                
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Upload className="h-4 w-4" />
                  <span>Supported formats: .xlsx, .xls</span>
                </div>
              </>
            )}
          </div>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">Error loading file</p>
              <p className="text-xs text-destructive/80 mt-1">{error}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};