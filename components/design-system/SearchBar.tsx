import React from "react";
import { Search, Filter, Download, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  onFilter?: () => void;
  onExport?: () => void;
  onUpload?: () => void;
  showFilter?: boolean;
  showExport?: boolean;
  showUpload?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  placeholder = "Search...",
  onFilter,
  onExport,
  onUpload,
  showFilter = true,
  showExport = true,
  showUpload = false,
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-2 mb-4 flex gap-2 items-center shadow-sm">
      <div className="flex-1 relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
        <Input
          placeholder={placeholder}
          className="pl-8 pr-2 py-1 border-gray-200 text-xs h-8"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search"
        />
      </div>

      {showUpload && onUpload && (
        <Button
          type="button"
          onClick={onUpload}
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          aria-label="Upload data"
        >
          <Upload className="w-3.5 h-3.5" />
          Upload
        </Button>
      )}

      {showExport && onExport && (
        <Button
          type="button"
          onClick={onExport}
          className="bg-green-600 hover:bg-green-700 h-8 text-xs"
          size="sm"
          aria-label="Export data"
        >
          <Download className="w-3.5 h-3.5" />
          Export
        </Button>
      )}

      {showFilter && onFilter && (
        <Button
          type="button"
          onClick={onFilter}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          aria-label="Filter data"
        >
          <Filter className="w-3.5 h-3.5" />
        </Button>
      )}
    </div>
  );
};
