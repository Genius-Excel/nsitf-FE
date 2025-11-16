// This hook contains the heavy lifting previously in ComplianceUploadModal.processFile
import { useCallback, useRef, useState } from "react";
import * as XLSX from "xlsx";
import type { ComplianceEntry, ParseProgress, UploadError } from "@/lib/types";
import { REQUIRED_COLUMNS, COLUMN_TYPES } from "@/lib/Constants";
import { calculateAchievement, generateId } from "@/lib/utils";

export const useFileUpload = () => {
  const [progress, setProgress] = useState<ParseProgress>({
    stage: "idle",
    percentage: 0,
    message: "",
  });
  const [errors, setErrors] = useState<UploadError[]>([]);
  const [successCount, setSuccessCount] = useState(0);
  const fileRef = useRef<File | null>(null);

  const validateRow = useCallback((row: any, rowIndex: number) => {
    const rowErrors: UploadError[] = [];
    REQUIRED_COLUMNS.forEach((column) => {
      const value = row[column];
      if (value === undefined || value === null || value === "") {
        rowErrors.push({
          row: rowIndex + 2,
          column,
          message: `Missing required field`,
          value: String(value || ""),
        });
        return;
      }
      const expectedType = COLUMN_TYPES[column];
      if (expectedType === "number") {
        const numValue = Number(value);
        if (isNaN(numValue)) {
          rowErrors.push({
            row: rowIndex + 2,
            column,
            message: `Expected number, got "${value}"`,
            value: String(value),
          });
        } else if (numValue < 0) {
          rowErrors.push({
            row: rowIndex + 2,
            column,
            message: `Value must be positive`,
            value: String(value),
          });
        }
      }
    });
    return rowErrors;
  }, []);

  const processFile = useCallback(
    async (file: File | null, selectedRegion: string | null) => {
      if (!file || !selectedRegion) {
        const sysErr: UploadError = {
          row: 0,
          column: "System",
          message: "Please select a region and upload a file",
        };
        setErrors([sysErr]);
        return { success: false, entries: [] as ComplianceEntry[] };
      }

      setErrors([]);
      setSuccessCount(0);

      try {
        setProgress({ stage: "reading", percentage: 10, message: "Reading file..." });

        const data = await file.arrayBuffer();
        await new Promise((r) => setTimeout(r, 200));

        setProgress({ stage: "parsing", percentage: 30, message: "Parsing spreadsheet data..." });

        const workbook = XLSX.read(data);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        await new Promise((r) => setTimeout(r, 200));

        if ((jsonData as any[]).length === 0) {
          throw new Error("The file contains no data rows.");
        }

        setProgress({ stage: "validating", percentage: 50, message: "Validating data..." });

        const allErrors: UploadError[] = [];
        const validRows: ComplianceEntry[] = [];

        (jsonData as any[]).forEach((row, index) => {
          const rowErrors = validateRow(row, index);
          if (rowErrors.length > 0) {
            allErrors.push(...rowErrors);
          } else {
            const contributionCollected = Number(row["Contribution Collected"]);
            const target = Number(row["Target"]);
            const achievement = calculateAchievement(contributionCollected, target);

            validRows.push({
              id: generateId(),
              region: selectedRegion,
              branch: row["Branch"],
              contributionCollected,
              target,
              achievement: Number(achievement.toFixed(2)),
              employersRegistered: Number(row["Employers Registered"]),
              employees: Number(row["Employees"]),
              registrationFees: Number(row["Registration Fees"]),
              certificateFees: Number(row["Certificate Fees"]),
              period: row["Period"],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }
          const validationProgress = 50 + ((index + 1) / (jsonData as any[]).length) * 40;
          setProgress({
            stage: "validating",
            percentage: validationProgress,
            message: `Validating row ${index + 1} of ${(jsonData as any[]).length}...`,
          });
        });

        await new Promise((r) => setTimeout(r, 200));

        if (allErrors.length > 0) {
          setErrors(allErrors);
          setProgress({
            stage: "error",
            percentage: 100,
            message: `Validation failed with ${allErrors.length} error(s)`,
          });
          return { success: false, entries: [] as ComplianceEntry[] };
        }

        setProgress({ stage: "complete", percentage: 100, message: `Successfully validated ${validRows.length} row(s)` });
        setSuccessCount(validRows.length);

        return { success: true, entries: validRows as ComplianceEntry[] };
      } catch (err: any) {
        setErrors([{
          row: 0,
          column: "System",
          message: err?.message || "Failed to process file.",
        }]);
        setProgress({ stage: "error", percentage: 100, message: "Processing failed" });
        return { success: false, entries: [] as ComplianceEntry[] };
      }
    },
    [validateRow]
  );

  const reset = useCallback(() => {
    setProgress({ stage: "idle", percentage: 0, message: "" });
    setErrors([]);
    setSuccessCount(0);
    fileRef.current = null;
  }, []);

  return {
    progress,
    errors,
    successCount,
    fileRef,
    processFile,
    reset,
    setErrors,
    setProgress,
    setSuccessCount,
  };
};
