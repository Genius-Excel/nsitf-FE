import { Search, Filter, Frown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Type for compliance data
export type ComplianceData = {
  id: string;
  region: string;
  branch: string;
  contribution_collected: number;
  target: number;
  achievement: string;
  employers_registered: number;
  period: string;
};

// Type for regions (from backend)
export type Region = {
  id: string;
  name: string;
};

export const ComplianceTable: React.FC<{
  complianceData: ComplianceData[];
  onClearFilters?: () => void;
}> = ({ complianceData, onClearFilters }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
    {complianceData.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Frown className="w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Data Found
        </h3>
        <p className="text-sm text-gray-500 max-w-md mb-4">
          It looks like there are no records matching your search or filters. Try
          adjusting your search term or clearing filters.
        </p>
        {onClearFilters && (
          <Button
            onClick={onClearFilters}
            variant="outline"
            className="text-sm border-gray-300 hover:bg-gray-50"
          >
            Clear Filters
          </Button>
        )}
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {[
                "Region",
                "Branch",
                "Contribution Collected",
                "Target",
                "Achievement",
                "Employers Registered",
                "Period",
              ].map((header) => (
                <th
                  key={header}
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {complianceData.map((data) => (
              <tr
                key={data.id}
                className="hover:bg-gray-50 transition-colors duration-200"
              >
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {data.region}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {data.branch}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  ₦{data.contribution_collected.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  ₦{data.target.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {data.achievement}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {data.employers_registered}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {data.period}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

export const ComplianceSearchAndFilter: React.FC<{
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterRegion: string;
  onRegionFilterChange: (value: string) => void;
  regions?: Region[]; // Regions from backend
}> = ({ searchTerm, onSearchChange, filterRegion, onRegionFilterChange, regions = [] }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6 flex gap-3 items-center">
    <div className="flex-1 relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
      <Input
        placeholder="Search by region or branch..."
        className="pl-10 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
    <Select value={filterRegion} onValueChange={onRegionFilterChange}>
      <SelectTrigger className="w-12 h-10 border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-center">
        <Filter className="w-4 h-4 text-gray-600" />
        {/* <SelectValue placeholder="Filter by region"/> */}
      </SelectTrigger>
      <SelectContent className="rounded-lg border-gray-100 shadow-sm">
        <SelectItem value="All Regions" className="text-sm">
          All Regions
        </SelectItem>
        {regions.map((region) => (
          <SelectItem
            key={region.id}
            value={region.id}
            className="text-sm hover:bg-gray-50"
          >
            {region.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);