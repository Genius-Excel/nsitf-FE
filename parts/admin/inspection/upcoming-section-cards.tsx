import { Badge } from "@/components/ui/badge";
import { CircleCheck } from "lucide-react";
import React, { FC } from "react";

interface UpcomingCardProps {
  companyName: string;
  location: string;
  date: string;
  inspectorName: string;
  status: "Scheduled" | "Pending";
}

const UpcomingSectionCard: FC<UpcomingCardProps> = ({
  companyName,
  date,
  inspectorName,
  location,
  status,
}) => {
  return (
    <div className="flex justify-between items-center border py-2 px-4 rounded-md hover:bg-gray-100">
      <div className="flex gap-4 items-center">
        <div className="bg-blue-100 rounded-sm p-2">
          <CircleCheck className="text-blue-700 h-4 w-4" />
        </div>
        <div>
          <h4>{companyName}</h4>
          <p className="text-muted-foreground">{location}</p>
        </div>
      </div>
      <div className="text-muted-foreground text-right">
        <p>{date}</p>
        <p>Inspector: {inspectorName}</p>
      </div>

      <Badge
        className={
          status === "Scheduled"
            ? "bg-green-100 text-green-700 font-medium text-sm"
            : "bg-yellow-100 text-yellow-700 font-medium text-sm"
        }
      >
        {status}
      </Badge>
    </div>
  );
};

export default UpcomingSectionCard;
