/**
 * Bulk Permission Upload Component
 *
 * Allows administrators to upload CSV files for bulk permission assignment
 */

"use client";

import React, { useState } from 'react';
import { Upload, Download, FileText, X, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getAccessToken } from '@/lib/utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface BulkPermissionUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface UploadResult {
  success: number;
  failed: number;
  errors: string[];
}

export function BulkPermissionUpload({ isOpen, onClose, onSuccess }: BulkPermissionUploadProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setResult(null);
    } else {
      toast({
        title: 'Invalid File',
        description: 'Please select a valid CSV file',
        variant: 'destructive',
      });
    }
  };

  const downloadTemplate = () => {
    const csvContent = 'user_id,permission_id,action\n07691c7f-dea3-4b3c-b3e7-acc9ca16f12c,f4db9ce6-cf2e-4053-971e-5cd0bfd0aa59,assign\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'permissions_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setResult(null);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',');

      // Validate headers
      if (!headers.includes('user_id') || !headers.includes('permission_id') || !headers.includes('action')) {
        throw new Error('Invalid CSV format. Required columns: user_id, permission_id, action');
      }

      let successCount = 0;
      let failedCount = 0;
      const errors: string[] = [];

      const token = getAccessToken();

      // Process each row
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const userId = values[0]?.trim();
        const permissionId = values[1]?.trim();
        const action = values[2]?.trim();

        if (!userId || !permissionId || !action) {
          errors.push(`Row ${i + 1}: Missing required fields`);
          failedCount++;
          continue;
        }

        if (action !== 'assign' && action !== 'remove') {
          errors.push(`Row ${i + 1}: Invalid action '${action}'. Must be 'assign' or 'remove'`);
          failedCount++;
          continue;
        }

        try {
          const response = await fetch(`${API_BASE_URL}/api/admin/users/permissions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              action,
              user_ids: [userId],
              permission_ids: [permissionId],
            }),
          });

          if (response.ok) {
            successCount++;
          } else {
            const errorData = await response.json();
            errors.push(`Row ${i + 1}: ${errorData.message || 'Failed to process'}`);
            failedCount++;
          }
        } catch (error) {
          errors.push(`Row ${i + 1}: Network error`);
          failedCount++;
        }
      }

      setResult({ success: successCount, failed: failedCount, errors });

      if (successCount > 0) {
        toast({
          title: 'Bulk Upload Complete',
          description: `Successfully processed ${successCount} permission(s)`,
        });
        onSuccess();
      }
    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Failed to process CSV file',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Upload className="w-5 h-5 text-green-600" />
            <span>Bulk Permission Upload</span>
          </DialogTitle>
          <DialogDescription>
            Upload a CSV file to assign or remove permissions for multiple users at once
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template Download */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-sm">CSV Template</p>
                    <p className="text-xs text-gray-500">Download template to get started</p>
                  </div>
                </div>
                <Button onClick={downloadTemplate} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download Template
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* File Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Upload CSV File</label>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              />
            </div>
            {file && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <FileText className="w-4 h-4" />
                <span>{file.name}</span>
                <Badge variant="outline">{(file.size / 1024).toFixed(2)} KB</Badge>
              </div>
            )}
          </div>

          {/* Upload Result */}
          {result && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="font-medium">Success: {result.success}</span>
                    </div>
                    {result.failed > 0 && (
                      <div className="flex items-center space-x-2">
                        <X className="w-5 h-5 text-red-600" />
                        <span className="font-medium">Failed: {result.failed}</span>
                      </div>
                    )}
                  </div>

                  {result.errors.length > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-medium">Errors:</span>
                      </div>
                      <div className="max-h-32 overflow-y-auto bg-gray-50 rounded p-3 space-y-1">
                        {result.errors.slice(0, 10).map((error, index) => (
                          <p key={index} className="text-xs text-red-600">{error}</p>
                        ))}
                        {result.errors.length > 10 && (
                          <p className="text-xs text-gray-500 italic">
                            ... and {result.errors.length - 10} more errors
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <h4 className="text-sm font-medium text-blue-900 mb-2">CSV Format Instructions:</h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Required columns: user_id, permission_id, action</li>
                <li>• action must be either 'assign' or 'remove'</li>
                <li>• user_id and permission_id must be valid UUIDs</li>
                <li>• Each row represents one permission operation</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button onClick={handleClose} variant="outline" disabled={uploading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="bg-green-600 hover:bg-green-700"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload & Process
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
