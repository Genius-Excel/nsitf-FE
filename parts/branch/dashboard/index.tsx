/**
 * Branch Data Portal Dashboard
 *
 * Main page for branch data officers to upload monthly reports and view history
 */

"use client";

import React from 'react';
import { FileSpreadsheet, Shield } from 'lucide-react';
import { BranchUploadForm } from '@/components/branch-upload-form';
import { BranchUploadHistory } from '@/components/branch-upload-history';

export default function BranchDashboard() {
  // Handle successful upload - refresh history
  const handleUploadSuccess = () => {
    // The history component will automatically refetch when it regains focus
    // or we could trigger a manual refresh here if needed
    window.location.reload();
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-green-600 text-white rounded-lg flex items-center justify-center">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Branch Reporting Portal
          </h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Submit your monthly branch reports and track their review status.
          Upload one consolidated Excel workbook per month containing all required data.
        </p>
      </div>

      {/* Security Notice */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-green-800">
          <Shield className="w-5 h-5" />
          <h3 className="font-medium">Secure Data Submission</h3>
        </div>
        <p className="text-green-700 text-sm mt-2">
          All uploaded files are encrypted and securely stored. Only authorized regional managers
          can review your submissions. Ensure your data is complete and accurate before submission.
        </p>
      </div>

      {/* Upload Form */}
      <BranchUploadForm onUploadSuccess={handleUploadSuccess} />

      {/* Upload History */}
      <BranchUploadHistory />
    </div>
  );
}
