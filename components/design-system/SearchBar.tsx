import React from "react";
import { Search, Filter, Download, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";

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
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 flex gap-3 items-center shadow-sm">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" aria-hidden="true" />
        <Input
          placeholder={placeholder}
          className="pl-10 border-gray-200 text-sm"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search"
        />
      </div>

      {showUpload && onUpload && (
        <button
          type="button"
          onClick={onUpload}
          className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md transition-colors text-sm font-medium flex items-center gap-2"
          aria-label="Upload data"
        >
          <Upload className="w-4 h-4" />
          Upload
        </button>
      )}

      {showExport && onExport && (
        <button
          type="button"
          onClick={onExport}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors text-sm font-medium flex items-center gap-2"
          aria-label="Export data"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      )}

      {showFilter && onFilter && (
        <button
          type="button"
          onClick={onFilter}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-600 hover:text-gray-900"
          aria-label="Filter data"
        >
          <Filter className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
