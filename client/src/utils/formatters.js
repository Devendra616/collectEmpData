// src/utils/formatters.js
import { formatDate } from "./dateConversion.js";

export const shouldHideField = (key) => {
  const lowerKey = key.toLowerCase();
  const allowList = ["sapid", "adhaarid"];
  return (
    key === "_id" ||
    key === "__v" ||
    lowerKey === "employeeid" ||
    lowerKey === "entry" ||
    (lowerKey.endsWith("id") && !allowList.includes(lowerKey))
  );
};

export const formatValue = (value) => {
  if (typeof value === "boolean") return value ? "Yes" : "No";

  // Handle date strings - format as dd/mm/yyyy
  if (typeof value === "string" && !isNaN(Date.parse(value))) {
    return formatDate(value, "dd/mm/yyyy");
  }

  // Handle Date objects - format as dd/mm/yyyy
  if (value instanceof Date) {
    return formatDate(value, "dd/mm/yyyy");
  }

  // Handle duration objects (for work experience)
  if (
    typeof value === "object" &&
    value !== null &&
    (value.years !== undefined ||
      value.months !== undefined ||
      value.days !== undefined)
  ) {
    const parts = [];
    if (value.years > 0) {
      parts.push(`${value.years} year${value.years !== 1 ? "s" : ""}`);
    }
    if (value.months > 0) {
      parts.push(`${value.months} month${value.months !== 1 ? "s" : ""}`);
    }
    if (value.days > 0) {
      parts.push(`${value.days} day${value.days !== 1 ? "s" : ""}`);
    }
    return parts.join(", ") || "0 days";
  }

  return String(value);
};

// Optional: Human-readable field name
export const formatKey = (key) =>
  key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
