import { InvestmentTreasury } from "@/parts/admin/investment/investment";
import { Suspense } from "react";

const InvestmentPage = () => {
  return (
    <Suspense fallback={<div>Loading Investment & Treasury...</div>}>
      <InvestmentTreasury />
    </Suspense>
  );
};

export default InvestmentPage;
