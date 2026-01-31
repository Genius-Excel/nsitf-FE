const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");

// Create a new workbook
const wb = XLSX.utils.book_new();

// COLLECTION sheet with proper column headers
const collectionData = [
  {
    BRANCH: "",
    "CONTRIBUTION COLLECTED": "",
    TARGET: "",
    "EMPLOYERS REGISTERED": "",
    EMPLOYEES: "",
    "PERFORMANCE RATE": "",
    "REGISTRATION FEES": "",
    "CERTIFICATE FEES": "",
    PERIOD: "",
  },
];
const wsCollection = XLSX.utils.json_to_sheet(collectionData);
XLSX.utils.book_append_sheet(wb, wsCollection, "COLLECTION");

// CLAIMS sheet
const claimsData = [
  {
    BRANCH: "",
    "CLAIMS DATA": "",
  },
];
const wsClaims = XLSX.utils.json_to_sheet(claimsData);
XLSX.utils.book_append_sheet(wb, wsClaims, "CLAIMS");

// INSPECTION sheet
const inspectionData = [
  {
    BRANCH: "",
    "INSPECTION DATA": "",
  },
];
const wsInspection = XLSX.utils.json_to_sheet(inspectionData);
XLSX.utils.book_append_sheet(wb, wsInspection, "INSPECTION");

// HSE sheet
const hseData = [
  {
    BRANCH: "",
    "HSE DATA": "",
  },
];
const wsHSE = XLSX.utils.json_to_sheet(hseData);
XLSX.utils.book_append_sheet(wb, wsHSE, "HSE");

// COMPLIANCE sheet (additional)
const complianceData = [
  {
    BRANCH: "",
    "COMPLIANCE STATUS": "",
    REMARKS: "",
  },
];
const wsCompliance = XLSX.utils.json_to_sheet(complianceData);
XLSX.utils.book_append_sheet(wb, wsCompliance, "COMPLIANCE");

// Create templates directory if it doesn't exist
const templatesDir = path.join(__dirname, "..", "public", "templates");
if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir, { recursive: true });
}

// Write the file
const outputPath = path.join(templatesDir, "compliance_template.xlsx");
XLSX.writeFile(wb, outputPath);
