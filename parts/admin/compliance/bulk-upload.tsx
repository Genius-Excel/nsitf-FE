import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Download } from "lucide-react";
import React from "react";

const BulkUploadCard = () => {
  return (
    <Card className="bg-[#eff6ff] py-6">
      <CardHeader>Bulk Upload Instructions</CardHeader>
      <CardContent className="p-6 space-y-6">
        <p className="text-muted-foreground">
          Upload compliance data in bulk using EXCEL or CSV format. Download the
          template to enusure correct formatting.
        </p>
        <Button variant={"outline"} className="w-full">
          <Download /> Download Template
        </Button>
      </CardContent>
    </Card>
  );
};

export default BulkUploadCard;
