"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Upload,
  Download,
} from "lucide-react";
import { PermissionGuard } from "@/components/permission-guard";
import ComplianceCard from "./compliance-card";
import BulkUploadCard from "./bulk-upload";
import { useState, useRef } from "react";
import {
  ComplianceData,
  ComplianceSearchAndFilter,
  ComplianceTable,
} from "./compliance-table";
import * as XLSX from "xlsx";

const mockCompliance = [
  {
    id: "1",
    title: "Annual Safety Audit",
    status: "Completed",
    dueDate: "2025-01-15",
    priority: "High",
    color: "green",
  },
  {
    id: "2",
    title: "Environmental Compliance Report",
    status: "In Progress",
    dueDate: "2025-02-01",
    priority: "Medium",
    color: "blue",
  },
  {
    id: "3",
    title: "Data Protection Assessment",
    status: "Pending",
    dueDate: "2025-02-15",
    priority: "High",
    color: "green",
  },
  {
    id: "4",
    title: "Quality Standards Review",
    status: "Completed",
    dueDate: "2025-01-10",
    priority: "Low",
    color: "blue",
  },
];

const sampleData: ComplianceData[] = [
  {
    id: "1",
    region: "Lagos",
    branch: "Headquarters",
    contribution_collected: 5000000,
    target: 6000000,
    achievement: "83%",
    employers_registered: 120,
    period: "Q1 2025",
  },
  {
    id: "2",
    region: "Abuja",
    branch: "Regional",
    contribution_collected: 3000000,
    target: 4000000,
    achievement: "75%",
    employers_registered: 80,
    period: "Q1 2025",
  },
];

export default function CompliancePage() {
  const [data, setData] = useState(sampleData);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRegion, setFilterRegion] = useState("All Regions");
  const [filterBranch, setFilterBranch] = useState("All Branches");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredData = data.filter((data) => {
    const matchesSearch =
      data.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
      data.branch.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion =
      filterRegion === "All Regions" || data.region === filterRegion;
    return matchesSearch && matchesRegion;
  });

  const handleEdit = (data: ComplianceData) => {
    console.log("Edit:", data);
    // Implement edit logic
  };

  const handleDelete = (id: string) => {
    console.log("Delete:", id);
    // Implement delete logic
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle2 className="h-4 w-4 text-primary" />;
      case "In Progress":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "Pending":
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<ComplianceData>(sheet, {
          header: [
            "id",
            "region",
            "branch",
            "contribution_collected",
            "target",
            "achievement",
            "employers_registered",
            "period",
          ],
        });
        // Update state with new data
        setData((prevData) => [...prevData, ...jsonData.slice(1)]); // Skip header row
      };
      reader.readAsArrayBuffer(file);
    }
  };

  // Handle file export
  const handleExportData = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Compliance Data");
    XLSX.writeFile(workbook, "compliance_data.xlsx");
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">Compliance Management</h1>
          <p className="text-muted-foreground">
            Track and manage compliance requirements
          </p>
        </div>
        <PermissionGuard permission="manage_compliance" fallback={null}>
          <div className="flex gap-2">
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileUpload}
              className="hidden"
              ref={fileInputRef}
            />
            <Button variant={"outline"} onClick={triggerFileInput}>
              <Upload className="mr-2 h-4 w-4" /> Upload Excel/CSV
            </Button>
            <Button variant={"outline"} onClick={handleExportData}>
              <Download className="mr-2 h-4 w-4" /> Export Data
            </Button>
            <Button className="gap-2 bg-[#00a63e] text-white">
              <Plus className="h-4 w-4" />
              Add Entry
            </Button>
          </div>
        </PermissionGuard>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <ComplianceCard
          color="green"
          heading="Total Collected"
          value="N54.00M"
        />
        <ComplianceCard color="blue" heading="Total Target" value="N67.00M" />
        <ComplianceCard
          color="green"
          heading="Compliance Rate"
          value="80.60%"
        />
        <ComplianceCard color="blue" heading="Total Employers" value="1,690" />
      </div>

      <div className="">
        <ComplianceSearchAndFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterRegion={filterRegion}
          onRegionFilterChange={setFilterRegion}
        />
        <ComplianceTable complianceData={filteredData} />
      </div>

      <BulkUploadCard />
    </div>
  );
}