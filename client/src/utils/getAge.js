export const getAgeFromDOB = (dob) => {
  if (!dob) return null;

  const birthDate = new Date(dob);
  const today = new Date();

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return { years, months, days };
};

export const getDiffFromDates = (start, end = new Date()) => {
  if (!start || !end) return null;

  const startDate = new Date(start);
  const endDate = new Date(end);

  // Set time to midnight for both dates
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  let years = endDate.getFullYear() - startDate.getFullYear();
  let months = endDate.getMonth() - startDate.getMonth();
  let days = endDate.getDate() - startDate.getDate() + 1;

  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return { years, months, days };
};

// format the duration as year(s) month(s) day(s)
export const formatDuration = (start, end = new Date()) => {
  const duration = getDiffFromDates(start, end);
  if (!duration) return "";

  const parts = [];
  if (duration.years > 0) {
    parts.push(`${duration.years} year${duration.years !== 1 ? "s" : ""}`);
  }
  if (duration.months > 0) {
    parts.push(`${duration.months} month${duration.months !== 1 ? "s" : ""}`);
  }
  if (duration.days > 0) {
    parts.push(`${duration.days} day${duration.days !== 1 ? "s" : ""}`);
  }

  return parts.join(", ");
};
