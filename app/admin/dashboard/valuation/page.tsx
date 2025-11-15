import { ValuationForecastingFunc } from "@/parts/admin/valuation/valuationFunc";
import { Suspense } from "react";

const ValuationPage = () => {
  return (
    <Suspense fallback={<div>Loading Valuation Forecasting...</div>}>
      <ValuationForecastingFunc />
    </Suspense>
  );
};

export default ValuationPage;
