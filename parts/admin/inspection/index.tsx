"use client";
import { PermissionGuard } from "@/components/permission-guard";
import ScheduleInspectionDate from "@/components/shedule-inspection";
import React from "react";
import InspectionCard from "./inspection.card";
import { InspectionLineChart } from "./inspection-line-chart";
import UpcomingSectionCard from "./upcoming-section-cards";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BigBtns from "./bigBtns";
import { Calendar, TrendingUp, TriangleAlert } from "lucide-react";

const Inspetion = () => {
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
          <ScheduleInspectionDate />
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
      <InspectionLineChart />
      <Card>
        <CardHeader className="flex justify-between items-center flex-row">
          <h2>Upcoming Sections</h2>
          <Button variant={"outline"} className="bg-gray-50">View All</Button>
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
          /><UpcomingSectionCard
            companyName="Blessed Sons Enterprises"
            date="10/10/2024"
            inspectorName="Chiwe George"
            location="Lagos"
            status="Pending"
          /><UpcomingSectionCard
            companyName="Blessed Sons Enterprises"
            date="10/10/2024"
            inspectorName="Chiwe George"
            location="Lagos"
            status="Scheduled"
          />
        </CardContent>
      </Card>
      <div className="grid grid-cols-3 gap-6">
        <BigBtns desription="Plan upcoming sites visit" icon={<Calendar className="text-green-700"/>} title="Schedule new inspection" color="green"/>
        <BigBtns desription="View Inspection Analyticd" icon={<TrendingUp className="text-blue-700"/>} title="Schedule new inspection" color="blue"/>
        <BigBtns desription="View Outstanding Cases" icon={<TriangleAlert className="text-yellow-700"/>} title="Schedule new inspection" color="yellow"/>
      </div>
    </div>
  );
};

export default Inspetion;
