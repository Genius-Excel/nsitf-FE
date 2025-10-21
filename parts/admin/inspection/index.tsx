"use client";
import { PermissionGuard } from "@/components/permission-guard";
import React from "react";
import InspectionCard from "./inspection.card";
import { InspectionBarChart } from "./inspection-line-chart";
import UpcomingSectionCard from "./upcoming-section-cards";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BigBtns from "./bigBtns";
import { Calendar, Plus, TrendingUp, TriangleAlert } from "lucide-react";
import ScheduleInspectionModal from "@/components/shedule-inspection";
import ViewAllInspectionsModal from "@/components/view-all-inspection";

const Inspetion = () => {
  const [isScheduleModalOpen, setIsScheduleModalOpen] = React.useState(false);
  const [isViewAllModalOpen, setIsViewAllModalOpen] = React.useState(false);

  const upcomingInspections = [
    {
      id: 1,
      employer: "Delta Manufacturing Ltd",
      location: "Lagos, Ikeja",
      date: "2025-10-05",
      inspector: "Ibrahim Musa",
      status: "Scheduled",
    },
    {
      id: 2,
      employer: "Sunrise Textiles",
      location: "Kano, Industrial Area",
      date: "2025-10-08",
      inspector: "Chioma Okonkwo",
      status: "Scheduled",
    },
    {
      id: 3,
      employer: "Tech Park Solutions",
      location: "Abuja, Wuse",
      date: "2025-10-10",
      inspector: "Adewale Johnson",
      status: "Pending",
    },
    {
      id: 4,
      employer: "Coastal Logistics",
      location: "Port Harcourt, GRA",
      date: "2025-10-12",
      inspector: "Ngozi Eze",
      status: "Scheduled",
    },
  ];

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">Inspection Management</h1>
          <p className="text-muted-foreground">
            Track and employers inspections, letters and debt recovery.
          </p>
        </div>
        <PermissionGuard permission="manage_compliance" fallback={null}>
          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition"
          >
            <Plus size={16} />
            Schedule Inspection
          </button>
        </PermissionGuard>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <InspectionCard
          color="blue"
          heading="Letters Served (YTD)"
          value="538"
        />
        <InspectionCard
          color="green"
          heading="Employers Inspected (YTD)"
          value="472"
        />
        <InspectionCard
          color="yellow"
          heading="Debts Established (YTD)"
          value="161"
        />
        <InspectionCard
          color="green"
          heading="Debts Recovered (YTD)"
          value="125"
        />
      </div>

      <InspectionBarChart />

      <Card>
        <CardHeader className="flex justify-between items-center flex-row">
          <h2>Upcoming Sections</h2>
          <Button variant="outline" onClick={() => setIsViewAllModalOpen(true)}>
            View All
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <UpcomingSectionCard
            companyName="Blessed Sons Enterprises"
            date="10/10/2024"
            inspectorName="Chiwe George"
            location="Lagos"
            status="Scheduled"
          />
          <UpcomingSectionCard
            companyName="Blessed Sons Enterprises"
            date="10/10/2024"
            inspectorName="Chiwe George"
            location="Lagos"
            status="Scheduled"
          />
          <UpcomingSectionCard
            companyName="Blessed Sons Enterprises"
            date="10/10/2024"
            inspectorName="Chiwe George"
            location="Lagos"
            status="Pending"
          />
          <UpcomingSectionCard
            companyName="Blessed Sons Enterprises"
            date="10/10/2024"
            inspectorName="Chiwe George"
            location="Lagos"
            status="Scheduled"
          />
        </CardContent>
      </Card>

      {/* <div className="grid grid-cols-3 gap-6">
        <BigBtns
          desription="Plan upcoming sites visit"
          icon={<Calendar className="text-green-700" />}
          title="Schedule new inspection"
          color="green"
          onclick={() => setIsScheduleModalOpen(true)}
        />
        <BigBtns
          desription="View Inspection Analyticd"
          icon={<TrendingUp className="text-blue-700" />}
          title="Generate Report"
          color="blue"
        />
        <BigBtns
          desription="View Outstanding Cases"
          icon={<TriangleAlert className="text-yellow-700" />}
          title="Non-Compliant Employers"
          color="yellow"
        />
      </div> */}

      {/* Modals at root level */}
      <ScheduleInspectionModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
      />

      <ViewAllInspectionsModal
        isOpen={isViewAllModalOpen}
        onClose={() => setIsViewAllModalOpen(false)}
        inspections={upcomingInspections}
      />
    </div>
  );
};

export default Inspetion;
