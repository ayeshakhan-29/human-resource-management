"use client";

import * as React from "react";
import { useState, useRef } from "react";
import { Paperclip, X, File, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EmployeeAttachmentsFormProps {
  attachments: File[];
  onAttachmentsChange: (attachments: File[]) => void;
  errors?: Record<string, { message?: string }>;
  existingAttachments?: Array<{
    filename: string;
    originalName: string;
    path: string;
    size: number;
    mimetype: string;
    uploadedAt: string;
  }>;
  onRemoveExisting?: (filename: string) => void;
  userId?: number;
}

export function EmployeeAttachmentsForm({
  attachments,
  onAttachmentsChange,
  errors = {},
  existingAttachments = [],
  onRemoveExisting,
  userId,
}: EmployeeAttachmentsFormProps) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fieldHasError = (field: string) => !!errors?.[field]?.message;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files);
      const validFiles = newFiles.filter((file) => {
        const maxSize = 20 * 1024 * 1024; // 20MB
        const allowedTypes = [
          'application/pdf',
          'image/png',
          'image/jpeg',
          'image/jpg',
          'image/gif',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/plain'
        ];
        return file.size <= maxSize && allowedTypes.includes(file.type);
      });

      if (validFiles.length !== newFiles.length) {
        alert("Some files were rejected. Only PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, GIF, and TXT files up to 20MB are allowed.");
      }

      onAttachmentsChange([...attachments, ...validFiles]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const newFiles = Array.from(e.target.files);
      const validFiles = newFiles.filter((file) => {
        const maxSize = 20 * 1024 * 1024; // 20MB
        const allowedTypes = [
          'application/pdf',
          'image/png',
          'image/jpeg',
          'image/jpg',
          'image/gif',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/plain'
        ];
        return file.size <= maxSize && allowedTypes.includes(file.type);
      });

      if (validFiles.length !== newFiles.length) {
        alert("Some files were rejected. Only PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, GIF, and TXT files up to 20MB are allowed.");
      }

      onAttachmentsChange([...attachments, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    const newAttachments = attachments.filter((_, i) => i !== index);
    onAttachmentsChange(newAttachments);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (mimetype: string) => {
    if (mimetype.startsWith("image/")) return "🖼️";
    if (mimetype.includes("pdf")) return "📄";
    if (mimetype.includes("word")) return "📝";
    if (mimetype.includes("excel") || mimetype.includes("spreadsheet")) return "📊";
    return "📎";
  };

  const handleDownloadAttachment = async (filename: string) => {
    if (!userId) {
      alert("User ID is required to download attachments");
      return;
    }

    try {
      const response = await fetch(`/api/employees/${userId}/download-attachment/${filename}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download attachment');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading attachment:', error);
      alert('Failed to download attachment');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Paperclip className="h-5 w-5" />
          Employee Attachments
        </CardTitle>
        <CardDescription>
          Upload documents related to the employee (contracts, certificates, etc.)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
            dragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          } ${fieldHasError("attachments") ? "border-red-500" : ""}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <Paperclip className="h-8 w-8 text-gray-500" />
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">
                <span className="text-blue-600 hover:text-blue-500 cursor-pointer">
                  Click to upload
                </span>{" "}
                or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, GIF, TXT (MAX. 20MB each)
              </p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileInput}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.txt"
          />
        </div>

        {fieldHasError("attachments") && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {errors.attachments?.message}
            </AlertDescription>
          </Alert>
        )}

        {/* New Files Preview */}
        {attachments.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">New Files to Upload:</h4>
            <div className="space-y-2">
              {attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">
                      {getFileIcon(file.type)}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Existing Attachments */}
        {existingAttachments.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Existing Attachments:</h4>
            <div className="space-y-2">
              {existingAttachments.map((attachment) => (
                <div
                  key={attachment.filename}
                  className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">
                      {getFileIcon(attachment.mimetype)}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {attachment.originalName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(attachment.size)} • Uploaded{" "}
                        {new Date(attachment.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadAttachment(attachment.filename)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    {onRemoveExisting && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveExisting(attachment.filename)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Summary */}
        {(attachments.length > 0 || existingAttachments.length > 0) && (
          <div className="text-xs text-gray-500 text-center">
            {attachments.length > 0 && (
              <p>{attachments.length} new file(s) ready to upload</p>
            )}
            {existingAttachments.length > 0 && (
              <p>{existingAttachments.length} existing attachment(s)</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
