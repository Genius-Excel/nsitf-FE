import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "lucide-react";
import React, { FC } from "react";

interface ComplianceCardProp{
 heading: string;
 color: "blue"|"green";
 value: string;
}

const ComplianceCard:FC<ComplianceCardProp> = ({color, heading, value}) => {
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

export default ComplianceCard;
