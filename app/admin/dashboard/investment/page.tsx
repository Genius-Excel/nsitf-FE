import InvestmentDashboard from "@/parts/admin/investment";
import { Suspense } from "react";

const InvestmentPage = () => {
  return (
    <Suspense fallback={<div>Loading Investment & Treasury...</div>}>
      <InvestmentDashboard />
    </Suspense>
  );
};

export default InvestmentPage;
