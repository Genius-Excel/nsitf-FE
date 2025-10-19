import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "lucide-react";
import React, { FC } from "react";

interface InspectionCardProp {
  heading: string;
  color: "blue" | "green" | "yellow";
  value: string;
}

const InspectionCard: FC<InspectionCardProp> = ({ color, heading, value }) => {
  return (
    <Card className={`border-border/50 bg-${color}-50`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-muted-foreground font-normal text-base">
          {heading}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-medium text-${color}-700`}>{value}</div>
      </CardContent>
    </Card>
  );
};

export default InspectionCard;
