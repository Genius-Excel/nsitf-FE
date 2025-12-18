/**
 * Branch Upload History Component
 *
 * Displays upload history with status badges and reviewer comments
 */

"use client";

import React, { useState } from "react";
import {
  History,
  FileText,
  Eye,
  Calendar,
  User,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LoadingState } from "@/components/design-system/LoadingState";
import { ErrorState } from "@/components/design-system/ErrorState";
import { useUploadHistory, type UploadRecord } from "@/hooks/useBranchData";
import { cn } from "@/lib/utils";

// ============== STATUS BADGE COMPONENT ==============

interface StatusBadgeProps {
  status: UploadRecord["status"];
}

function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig: Record<
    string,
    { label: string; variant: "secondary"; className: string }
  > = {
    submitted: {
      label: "Submitted",
      variant: "secondary" as const,
      className: "bg-blue-100 text-blue-800 border-blue-200",
    },
    under_review: {
      label: "Under Review",
      variant: "secondary" as const,
      className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
    approved: {
      label: "Approved",
      variant: "secondary" as const,
      className: "bg-green-100 text-green-800 border-green-200",
    },
    rejected: {
      label: "Rejected",
      variant: "secondary" as const,
      className: "bg-red-100 text-red-800 border-red-200",
    },
    completed: {
      label: "Completed",
      variant: "secondary" as const,
      className: "bg-green-100 text-green-800 border-green-200",
    },
  };

  const config = statusConfig[status] || {
    label: status || "Unknown",
    variant: "secondary" as const,
    className: "bg-gray-100 text-gray-800 border-gray-200",
  };

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
}

// ============== COMMENT MODAL COMPONENT ==============

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: UploadRecord | null;
}

function CommentModal({ isOpen, onClose, record }: CommentModalProps) {
  if (!record) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-gray-600" />
            <span>Reviewer Comment</span>
          </DialogTitle>
          <DialogDescription>
            Review feedback for {record.fileName} ({record.period})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Review Info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-700">Status</p>
              <StatusBadge status={record.status} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Reviewed By</p>
              <p className="text-sm text-gray-600">
                {record.reviewedBy || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Reviewed On</p>
              <p className="text-sm text-gray-600">
                {record.reviewedAt
                  ? new Date(record.reviewedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "N/A"}
              </p>
            </div>
          </div>

          {/* Comment */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Comment</p>
            <ScrollArea className="h-32">
              <div className="p-3 bg-white border rounded-md">
                <p className="text-sm text-gray-800 whitespace-pre-wrap">
                  {record.reviewerComment || "No comment provided."}
                </p>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============== HISTORY TABLE ROW ==============

interface HistoryRowProps {
  record: UploadRecord;
  onViewComment: (record: UploadRecord) => void;
}

function HistoryRow({ record, onViewComment }: HistoryRowProps) {
  const formatPeriod = (period: string) => {
    const [year, month] = period.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const truncateComment = (comment: string | undefined, maxLength = 50) => {
    if (!comment) return "No comment";
    if (comment.length <= maxLength) return comment;
    return comment.substring(0, maxLength) + "...";
  };

  return (
    <tr className="border-b hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="font-medium text-gray-900">
            {formatPeriod(record.period)}
          </span>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-gray-400" />
          <span className="text-gray-800 font-mono text-sm">
            {record.fileName}
          </span>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="text-gray-600">{formatDate(record.submittedAt)}</span>
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={record.status} />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 flex-1">
            {truncateComment(record.reviewerComment)}
          </span>
          {record.reviewerComment && (
            <Button
              onClick={() => onViewComment(record)}
              variant="ghost"
              size="sm"
              className="ml-2 text-green-600 hover:text-green-700 hover:bg-green-50"
            >
              <Eye className="w-4 h-4" />
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}

// ============== EMPTY STATE COMPONENT ==============

function EmptyHistoryState() {
  return (
    <div className="text-center py-12">
      <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No Upload History
      </h3>
      <p className="text-gray-500 max-w-md mx-auto">
        You haven't submitted any reports yet. Upload your first monthly report
        using the form above.
      </p>
    </div>
  );
}

// ============== MAIN HISTORY COMPONENT ==============

export function BranchUploadHistory() {
  const { history, loading, error, refetch } = useUploadHistory();
  const [selectedRecord, setSelectedRecord] = useState<UploadRecord | null>(
    null
  );

  const handleViewComment = (record: UploadRecord) => {
    setSelectedRecord(record);
  };

  const closeCommentModal = () => {
    setSelectedRecord(null);
  };

  // Loading state
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="w-5 h-5 text-gray-600" />
            <span>Upload History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingState message="Loading upload history..." />
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="w-5 h-5 text-gray-600" />
            <span>Upload History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorState
            title="Failed to Load History"
            message={error}
            onRetry={refetch}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="w-5 h-5 text-gray-600" />
            <span>Upload History</span>
          </CardTitle>
          <CardDescription>
            Track your submission status and reviewer feedback for all uploaded
            reports
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          {history.length === 0 ? (
            <EmptyHistoryState />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Period
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      File Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Submitted On
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Reviewer Comment
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((record) => (
                    <HistoryRow
                      key={record.id}
                      record={record}
                      onViewComment={handleViewComment}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comment Modal */}
      <CommentModal
        isOpen={!!selectedRecord}
        onClose={closeCommentModal}
        record={selectedRecord}
      />
    </>
  );
}
