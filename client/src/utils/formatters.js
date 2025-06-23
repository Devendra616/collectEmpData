// src/utils/formatters.js

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
  if (typeof value === "string" && !isNaN(Date.parse(value))) {
    const date = new Date(value);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  return String(value);
};

// Optional: Human-readable field name
export const formatKey = (key) =>
  key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
