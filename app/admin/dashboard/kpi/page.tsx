import { KPIAnalyticsFunc } from "@/parts/admin/kpi/kpiAnalyticsFunc";
import { Suspense } from "react";

const Kpi = () => {
  return (
    <div>
      <Suspense>
        <KPIAnalyticsFunc />
      </Suspense>
    </div>
  );
};

export default Kpi;
