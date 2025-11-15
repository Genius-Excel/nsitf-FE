import { useState, useEffect } from "react";
import { ComplianceApiResponse, RegionalSummary } from "../lib/types/compliance";

const useComplianceData = (apiUrl: string) => {
  const [regionalSummary, setRegionalSummary] = useState<RegionalSummary[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(apiUrl);

        if (!res.ok) {
          throw new Error(`API responded with status ${res.status}`);
        }

        const data: ComplianceApiResponse = await res.json();

        setRegionalSummary(data.regional_summary);

        const regionNames = Array.from(
          new Set(
            data.regional_summary
              .map((r) => r.region ?? "")
              .filter((region) => region.trim() !== "")
          )
        );

        setRegions(regionNames);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl]);

  return { regionalSummary, regions, loading, error };
};

export default useComplianceData;
