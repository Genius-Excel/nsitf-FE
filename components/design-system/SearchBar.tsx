import React from "react";
import { Search, Filter, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  onFilter?: () => void;
  onUpload?: () => void;
  showFilter?: boolean;
  showUpload?: boolean;
  uploadButtonText?: string;
  uploadButtonColor?: "green" | "blue";
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  placeholder = "Search...",
  onFilter,
  onUpload,
  showFilter = true,
  showUpload = false,
  uploadButtonText = "Upload",
  uploadButtonColor = "green",
}) => {
  const uploadColorClass = uploadButtonColor === "green"
    ? "bg-green-600 hover:bg-green-700"
    : "bg-blue-600 hover:bg-blue-700";

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-2 mb-4 flex gap-2 items-center shadow-sm">
      <div className="flex-1 relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
        <Input
          placeholder={placeholder}
          className="pl-8 pr-2 py-1 border-gray-200 text-xs h-8 font-medium"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search"
        />
      </div>

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

      {showUpload && onUpload && (
        <Button
          type="button"
          onClick={onUpload}
          size="sm"
          className={`${uploadColorClass} text-white h-8 text-xs font-medium`}
          aria-label="Upload data"
        >
          <Upload className="w-3.5 h-3.5 mr-1" />
          {uploadButtonText}
        </Button>
      )}
    </div>
  );
};
