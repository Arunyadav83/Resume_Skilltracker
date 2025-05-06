import React, { useState, useRef } from "react";
import { Upload, X, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

interface FileUploaderProps {
  onFileUpload: (file: File) => Promise<void>;
  isProcessing: boolean;
}

export function FileUploader({ onFileUpload, isProcessing }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selectedFile = e.target.files?.[0];
    
    if (!selectedFile) return;
    
    // Validate file type
    const validTypes = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload a PDF or Word document (.pdf, .doc, .docx)');
      return;
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setError('File size exceeds 5MB limit');
      return;
    }
    
    setFile(selectedFile);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    try {
      await onFileUpload(file);
      toast({
        title: "File uploaded successfully",
        description: "Your resume is being analyzed",
      });
    } catch (err) {
      console.error("Error uploading file:", err);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "There was an error uploading your file. Please try again.",
      });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Upload Resume</h2>
        
        {/* File Upload Area */}
        <div 
          className="border-2 border-dashed rounded-lg p-6 mb-4 text-center cursor-pointer transition hover:bg-gray-50 border-gray-300"
          onClick={handleBrowseClick}
        >
          <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
          <h3 className="font-medium mb-1">Drag and drop your file here</h3>
          <p className="text-sm text-gray-500 mb-2">or click to browse</p>
          <p className="text-xs text-gray-400">Supports PDF, DOCX, and DOC files</p>
          
          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef}
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
          />
        </div>
        
        {/* Selected File Info */}
        {file && (
          <div className="mb-4">
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
              <Upload className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium truncate">{file.name}</span>
              <span className="text-xs text-gray-500 ml-auto">{formatFileSize(file.size)}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-gray-400 hover:text-gray-600"
                onClick={handleRemoveFile}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {/* Upload Button */}
        <Button 
          className="w-full"
          onClick={handleUpload}
          disabled={!file || isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
            </>
          ) : (
            <>Upload and Analyze</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
