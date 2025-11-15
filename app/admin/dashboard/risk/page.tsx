import { RiskAnalysisFunc } from "@/parts/admin/risk/riskAnalysisFunc";
import { Suspense } from "react";

const RiskDashboardPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RiskAnalysisFunc />
    </Suspense>
  );
};

export default RiskDashboardPage;
