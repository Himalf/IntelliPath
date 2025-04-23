import React, { useState, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Loader2, CheckCircle } from "lucide-react";
import resumeService from "@/services/resumeService";

interface ResumeUploadProps {
  userId: string;
  onSuccess?: () => void;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ userId, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = (selectedFile: File) => {
    if (selectedFile.type !== "application/pdf") {
      toast.error("Please upload a PDF file only");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    setFile(selectedFile);
    toast.success("Resume selected successfully!");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      validateAndSetFile(selected);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.warning("Please select a resume to upload.");
      return;
    }

    setIsUploading(true);

    try {
      const result = await resumeService.analyzeResume(userId, file);
      toast.success("Resume analyzed successfully!");
      console.log("Uploading file:", file);

      console.log("Analysis Result:", result);
      onSuccess?.();
      clearFile();
    } catch (error) {
      toast.error("Error analyzing resume.");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6 max-w-md mx-auto bg-white p-6 rounded-xl shadow-md border border-gray-200">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Upload Resume</h2>
        <p className="text-sm text-gray-500 mt-1">
          Get AI-powered insights from your resume (PDF only, max 5MB)
        </p>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer ${
          isDragging
            ? "bg-blue-50 border-blue-500"
            : "hover:bg-gray-50 border-gray-300"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          accept=".pdf"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />

        {file ? (
          <div className="flex flex-col items-center gap-2">
            <FileText className="w-8 h-8 text-blue-600" />
            <p className="text-gray-800 font-medium">{file.name}</p>
            <p className="text-xs text-gray-500">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <button
              className="text-sm text-red-500 hover:underline mt-2"
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
            >
              Remove File
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-gray-400" />
            <p className="text-gray-600 font-medium">Drag & Drop or Click</p>
            <p className="text-xs text-gray-400">PDF only • Max 5MB</p>
          </div>
        )}
      </div>

      <Button
        className="w-full h-11 cursor-pointer"
        onClick={handleUpload}
        disabled={isUploading || !file}
      >
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <CheckCircle className="mr-2 h-5 w-5 " />
            Upload & Analyze
          </>
        )}
      </Button>
    </div>
  );
};

export default ResumeUpload;
