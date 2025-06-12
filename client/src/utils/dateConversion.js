export const formatDate = (dateString, format = "yyyy-mm-dd") => {
  if (!dateString) return "";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return ""; // Return empty string for invalid dates

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  switch (format.toLowerCase()) {
    case "yyyy/mm/dd":
      return `${year}/${month}/${day}`;
    case "mm/dd/yyyy":
      return `${month}/${day}/${year}`;
    case "dd/mm/yyyy":
      return `${day}/${month}/${year}`;
    case "yyyy-mm-dd":
      return `${year}-${month}-${day}`;
    case "dd-mm-yyyy":
    default:
      return `${day}-${month}-${year}`;
  }
};
