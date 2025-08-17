import React from "react";
import pdfMake from "pdfmake/build/pdfmake";
import "pdfmake/build/vfs_fonts"; // Import vfs_fonts directly

// Utility functions
const formatValue = (value, key = "") => {
  if (value === null || value === undefined) return "Not Provided";
  if (typeof value === "boolean") return value ? "Yes" : "No";

  // Date formatting
  if (key.includes("Date") || key === "dob") {
    if (!value) return "Not Provided";
    const date = new Date(value);
    return date.toLocaleDateString("en-GB");
  }

  // Duration formatting
  if (key === "duration") {
    if (typeof value === "object" && value.years !== undefined) {
      return `${value.years} years ${value.months || 0} months ${
        value.days || 0
      } days`;
    }
    return `${value} years`;
  }

  // Salary formatting
  if (key === "grossSalary") {
    return `₹${Number(value).toLocaleString()}`;
  }

  return value.toString();
};

const formatKey = (key) => {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .replace(/Id$/, "ID")
    .replace(/Sap/, "SAP")
    .replace(/Dob/, "Date of Birth");
};

const shouldHideField = (key) => {
  const hiddenFields = ["id", "_id", "__v", "createdAt", "updatedAt"];
  return hiddenFields.includes(key);
};

const generatePDF = (formData) => {
  try {
    console.log("Generating PDF with data:", formData);

    const docDefinition = {
      content: [
        {
          text: "Employee Application Form",
          style: "header",
          alignment: "center",
          margin: [0, 0, 0, 30],
        },
        ...generateSections(formData),
      ],
      styles: {
        header: {
          fontSize: 20,
          bold: true,
          color: "#2E86AB",
        },
        sectionHeader: {
          fontSize: 14,
          bold: true,
          margin: [0, 15, 0, 8],
          color: "#2E86AB",
        },
        tableCell: {
          fontSize: 9,
          margin: [5, 3, 5, 3],
        },
        entryHeader: {
          fontSize: 11,
          bold: true,
          color: "#2E86AB",
          margin: [5, 8, 5, 5],
        },
      },
      defaultStyle: {
        fontSize: 10,
        color: "#333333",
      },
      pageMargins: [40, 40, 40, 40],
    };

    const pdfDoc = pdfMake.createPdf(docDefinition);
    pdfDoc.download("employee_application.pdf");

    console.log("PDF generated successfully");
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error(`PDF generation failed: ${error.message}`);
  }
};

const generateSections = (formData) => {
  const sections = [];

  const sectionConfigs = [
    { key: "personal", title: "Personal Details" },
    { key: "education", title: "Education Details" },
    { key: "family", title: "Family Details" },
    { key: "address", title: "Address Details" },
    { key: "work", title: "Work Experience" },
  ];

  sectionConfigs.forEach(({ key, title }) => {
    if (formData[key]) {
      sections.push({
        text: title,
        style: "sectionHeader",
      });
      sections.push(generateTableFromData(formData[key], title));
    }
  });

  return sections;
};

const generateTableFromData = (data, sectionTitle) => {
  console.log(`Generating table for ${sectionTitle}:`, data);

  // Handle the data structure from your form context
  let sectionData = data?.data || data;

  if (
    !sectionData ||
    (Array.isArray(sectionData) && sectionData.length === 0)
  ) {
    return {
      text: `No ${sectionTitle.toLowerCase()} available`,
      italics: true,
      color: "#666666",
      margin: [0, 5, 0, 15],
    };
  }

  const tableBody = [];

  if (Array.isArray(sectionData)) {
    // Handle multiple entries
    sectionData.forEach((item, index) => {
      if (item && typeof item === "object") {
        // Add entry header for multiple entries
        if (sectionData.length > 1) {
          tableBody.push([
            {
              text: `${sectionTitle} - Entry ${index + 1}`,
              colSpan: 2,
              style: "entryHeader",
              fillColor: "#f5f5f5",
            },
            {},
          ]);
        }

        // Add data rows
        Object.entries(item)
          .filter(([key]) => !shouldHideField(key))
          .forEach(([key, value]) => {
            tableBody.push([
              { text: formatKey(key), style: "tableCell", bold: true },
              { text: formatValue(value, key), style: "tableCell" },
            ]);
          });

        // Add spacing between entries
        if (index < sectionData.length - 1) {
          tableBody.push([{ text: "", colSpan: 2, margin: [0, 8, 0, 0] }, {}]);
        }
      }
    });
  } else if (typeof sectionData === "object") {
    // Handle single object
    Object.entries(sectionData)
      .filter(([key]) => !shouldHideField(key))
      .forEach(([key, value]) => {
        tableBody.push([
          { text: formatKey(key), style: "tableCell", bold: true },
          { text: formatValue(value, key), style: "tableCell" },
        ]);
      });
  }

  if (tableBody.length === 0) {
    return {
      text: `No data available for ${sectionTitle.toLowerCase()}`,
      italics: true,
      color: "#666666",
      margin: [0, 5, 0, 15],
    };
  }

  return {
    table: {
      headerRows: 0,
      widths: ["35%", "65%"],
      body: tableBody,
    },
    layout: {
      hLineWidth: () => 0.5,
      vLineWidth: () => 0.5,
      hLineColor: () => "#dddddd",
      vLineColor: () => "#dddddd",
      paddingLeft: () => 8,
      paddingRight: () => 8,
      paddingTop: () => 6,
      paddingBottom: () => 6,
      fillColor: (rowIndex) => {
        return rowIndex % 2 === 0 ? "#fafafa" : "white";
      },
    },
    margin: [0, 0, 0, 20],
  };
};

// React component
const PDFGenerator = ({ formData, isSubmitted }) => {
  const handleDownloadPDF = () => {
    if (!formData || !isSubmitted) {
      console.error("Form data not available or form not submitted");
      return;
    }

    try {
      generatePDF(formData);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  if (!isSubmitted || !formData) {
    return null;
  }

  return (
    <button
      onClick={handleDownloadPDF}
      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors cursor-pointer"
      style={{
        marginTop: "10px",
        display: "inline-block",
      }}
    >
      Download PDF
    </button>
  );
};

export default PDFGenerator;
