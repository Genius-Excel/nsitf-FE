import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { DollarSign, TrendingUp, TrendingDown, Upload, FileDown, Building2, Landmark, Users2, Wallet, Receipt, MoreVertical, Eye, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Mock data for contributions by source (stacked area chart)
const contributionsTrendData = [
  { period: "Jan", private: 45000000, publicTreasury: 32000000, publicNonTreasury: 18000000, informal: 8500000 },
  { period: "Feb", private: 48000000, publicTreasury: 34000000, publicNonTreasury: 19500000, informal: 9200000 },
  { period: "Mar", private: 52000000, publicTreasury: 35500000, publicNonTreasury: 21000000, informal: 10100000 },
  { period: "Apr", private: 49500000, publicTreasury: 36000000, publicNonTreasury: 20500000, informal: 9800000 },
  { period: "May", private: 54000000, publicTreasury: 38000000, publicNonTreasury: 22000000, informal: 11000000 },
  { period: "Jun", private: 57000000, publicTreasury: 40000000, publicNonTreasury: 23500000, informal: 11500000 },
];

// Mock data for fees collection (line chart)
const feesCollectionData = [
  { period: "Jan", rental: 2500000, ecsRegistration: 1800000, ecsCertificate: 950000 },
  { period: "Feb", rental: 2650000, ecsRegistration: 1920000, ecsCertificate: 1020000 },
  { period: "Mar", rental: 2800000, ecsRegistration: 2100000, ecsCertificate: 1150000 },
  { period: "Apr", rental: 2720000, ecsRegistration: 2050000, ecsCertificate: 1080000 },
  { period: "May", rental: 2950000, ecsRegistration: 2200000, ecsCertificate: 1200000 },
  { period: "Jun", rental: 3100000, ecsRegistration: 2350000, ecsCertificate: 1280000 },
];

// Mock data for financial records table
const financialRecords = [
  {
    id: 1,
    period: "Q2 2025",
    privateSector: 57000000,
    publicTreasury: 40000000,
    publicNonTreasury: 23500000,
    informalEconomy: 11500000,
    rentalFees: 3100000,
    ecsRegistration: 2350000,
    ecsCertificate: 1280000,
    startDate: "2025-04-01",
    endDate: "2025-06-30",
    status: "validated"
  },
  {
    id: 2,
    period: "Q1 2025",
    privateSector: 52000000,
    publicTreasury: 35500000,
    publicNonTreasury: 21000000,
    informalEconomy: 10100000,
    rentalFees: 2800000,
    ecsRegistration: 2100000,
    ecsCertificate: 1150000,
    startDate: "2025-01-01",
    endDate: "2025-03-31",
    status: "validated"
  },
  {
    id: 3,
    period: "Q4 2024",
    privateSector: 48000000,
    publicTreasury: 32000000,
    publicNonTreasury: 19000000,
    informalEconomy: 9200000,
    rentalFees: 2600000,
    ecsRegistration: 1950000,
    ecsCertificate: 1050000,
    startDate: "2024-10-01",
    endDate: "2024-12-31",
    status: "validated"
  },
  {
    id: 4,
    period: "Q3 2024",
    privateSector: 45000000,
    publicTreasury: 30000000,
    publicNonTreasury: 18000000,
    informalEconomy: 8500000,
    rentalFees: 2450000,
    ecsRegistration: 1800000,
    ecsCertificate: 980000,
    startDate: "2024-07-01",
    endDate: "2024-09-30",
    status: "pending"
  },
];

// Metric cards data
const metricsData = [
  {
    label: "Contribution Collected – Private Sector",
    amount: 57000000,
    change: 8.5,
    icon: Building2
  },
  {
    label: "Contribution Collected – Public (Treasury Funded)",
    amount: 40000000,
    change: 5.3,
    icon: Landmark
  },
  {
    label: "Contribution Collected – Public (Non-Treasury Funded)",
    amount: 23500000,
    change: 6.8,
    icon: Landmark
  },
  {
    label: "Contribution Collected – Informal Economy",
    amount: 11500000,
    change: 4.5,
    icon: Users2
  },
  {
    label: "Rental Fees",
    amount: 3100000,
    change: 7.2,
    icon: Receipt
  },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatCurrencyShort = (value: number) => {
  if (value >= 1000000) {
    return `₦${(value / 1000000).toFixed(1)}M`;
  }
  return formatCurrency(value);
};

export function InvestmentTreasury() {
  const [dateRange, setDateRange] = useState("this-month");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(financialRecords.length / itemsPerPage);
  const paginatedRecords = financialRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#" onClick={(e: any) => e.preventDefault()}>
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Investment & Treasury Management</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-green-700">Investment & Treasury Management</h1>
          <p className="text-muted-foreground mt-1">
            Monitor contribution collections, fees, and financial performance across all sectors
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-quarter">Last Quarter</SelectItem>
              <SelectItem value="ytd">YTD</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <FileDown className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Upload className="h-4 w-4 mr-2" />
                Upload Financial Record
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Upload Financial Record</DialogTitle>
                <DialogDescription>
                  Upload financial data for contribution collections and fees. Supported formats: CSV, XLSX
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="file">Financial Data File</Label>
                  <Input id="file" type="file" accept=".csv,.xlsx" />
                  <p className="text-muted-foreground">
                    Upload CSV or Excel file containing financial records
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input id="start-date" type="date" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="end-date">End Date</Label>
                    <Input id="end-date" type="date" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="organization">Organization</Label>
                  <Select>
                    <SelectTrigger id="organization">
                      <SelectValue placeholder="Select organization" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nsitf">NSITF Central</SelectItem>
                      <SelectItem value="lagos">Lagos Branch</SelectItem>
                      <SelectItem value="abuja">Abuja Branch</SelectItem>
                      <SelectItem value="ph">Port Harcourt Branch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="validation-notes">Validation Notes (Optional)</Label>
                  <Textarea 
                    id="validation-notes" 
                    placeholder="Add any validation notes or comments..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="bg-green-600 hover:bg-green-700" onClick={() => setUploadDialogOpen(false)}>
                  Upload Record
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Metric Cards Section */}
      <div className="grid grid-cols-5 gap-4">
        {metricsData.map((metric, index) => {
          const Icon = metric.icon;
          const isPositive = metric.change > 0;
          
          return (
            <Card key={index} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-green-600" />
                </div>
                <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  <span className="text-xs">{Math.abs(metric.change)}%</span>
                </div>
              </div>
              <p className="text-muted-foreground uppercase tracking-wide mb-2">{metric.label}</p>
              <p className="text-green-700 mb-1">{formatCurrency(metric.amount)}</p>
              <p className="text-muted-foreground">vs previous period</p>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-3 gap-6">
        {/* Stacked Area Chart - Contributions by Source */}
        <Card className="col-span-2 p-6">
          <div className="mb-4">
            <h3>Contribution Trends by Source</h3>
            <p className="text-muted-foreground mt-1">Monthly contribution collections across all sectors</p>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={contributionsTrendData}>
              <defs>
                <linearGradient id="colorPrivate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorPublicTreasury" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorPublicNonTreasury" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorInformal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="period" stroke="#6b7280" />
              <YAxis 
                stroke="#6b7280" 
                tickFormatter={(value) => formatCurrencyShort(value)}
              />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="rect"
              />
              <Area 
                type="monotone" 
                dataKey="private" 
                stackId="1" 
                stroke="#16a34a" 
                fill="url(#colorPrivate)" 
                name="Private Sector"
              />
              <Area 
                type="monotone" 
                dataKey="publicTreasury" 
                stackId="1" 
                stroke="#3b82f6" 
                fill="url(#colorPublicTreasury)" 
                name="Public Treasury Funded"
              />
              <Area 
                type="monotone" 
                dataKey="publicNonTreasury" 
                stackId="1" 
                stroke="#8b5cf6" 
                fill="url(#colorPublicNonTreasury)" 
                name="Public Non-Treasury"
              />
              <Area 
                type="monotone" 
                dataKey="informal" 
                stackId="1" 
                stroke="#f59e0b" 
                fill="url(#colorInformal)" 
                name="Informal Economy"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Multi-Line Chart - Fees Collection */}
        <Card className="p-6">
          <div className="mb-4">
            <h3>Fees Collection Trend</h3>
            <p className="text-muted-foreground mt-1">Monthly fees breakdown</p>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={feesCollectionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="period" stroke="#6b7280" />
              <YAxis 
                stroke="#6b7280"
                tickFormatter={(value) => formatCurrencyShort(value)}
              />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
              />
              <Line 
                type="monotone" 
                dataKey="rental" 
                stroke="#16a34a" 
                strokeWidth={2}
                name="Rental Fees"
                dot={{ fill: '#16a34a', r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="ecsRegistration" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="ECS Registration"
                dot={{ fill: '#3b82f6', r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="ecsCertificate" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                name="ECS Certificate"
                dot={{ fill: '#8b5cf6', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Financial Records Table */}
      <Card>
        <div className="p-6 border-b">
          <h3>Financial Records</h3>
          <p className="text-muted-foreground mt-1">Complete ledger of all contribution collections and fees</p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky top-0 bg-white">Period</TableHead>
                <TableHead className="sticky top-0 bg-white text-right">Private Sector</TableHead>
                <TableHead className="sticky top-0 bg-white text-right">Public – Treasury</TableHead>
                <TableHead className="sticky top-0 bg-white text-right">Public – Non-Treasury</TableHead>
                <TableHead className="sticky top-0 bg-white text-right">Informal Economy</TableHead>
                <TableHead className="sticky top-0 bg-white text-right">Rental Fees</TableHead>
                <TableHead className="sticky top-0 bg-white text-right">ECS Registration</TableHead>
                <TableHead className="sticky top-0 bg-white text-right">ECS Certificate</TableHead>
                <TableHead className="sticky top-0 bg-white">Start Date</TableHead>
                <TableHead className="sticky top-0 bg-white">End Date</TableHead>
                <TableHead className="sticky top-0 bg-white">Status</TableHead>
                <TableHead className="sticky top-0 bg-white text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRecords.map((record, index) => (
                <TableRow key={record.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <TableCell>{record.period}</TableCell>
                  <TableCell className="text-right">{formatCurrency(record.privateSector)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(record.publicTreasury)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(record.publicNonTreasury)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(record.informalEconomy)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(record.rentalFees)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(record.ecsRegistration)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(record.ecsCertificate)}</TableCell>
                  <TableCell>{new Date(record.startDate).toLocaleDateString('en-GB')}</TableCell>
                  <TableCell>{new Date(record.endDate).toLocaleDateString('en-GB')}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={record.status === 'validated' ? 'default' : 'secondary'}
                      className={record.status === 'validated' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'}
                    >
                      {record.status === 'validated' ? 'Validated' : 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Download Record
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t">
          <p className="text-muted-foreground">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, financialRecords.length)} of {financialRecords.length} records
          </p>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={currentPage === page ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}