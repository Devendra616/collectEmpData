import mongoose from "mongoose";

const experienceSchema = new mongoose.Schema({
  companyName: String,
  role: String,
  startDate: Date,
  relievingDate: Date,
  duration: {
    years: Number,
    months: Number,
    days: Number,
  },
  grossSalary: Number,
  city: String,
  industry: String,
  isGreenfield: Boolean, //YES or NO
  reasonForLeaving: String,
  scaleOnLeaving: String,
  responsibilities: String,
});

/* // Pre-save middleware to calculate duration
experienceSchema.pre("save", function (next) {
  console.log("presave called");
  if (this.startDate && this.relievingDate) {
    const start = new Date(this.startDate);
    const end = new Date(this.relievingDate);
    console.log(start, end);
    // Calculate the difference in milliseconds
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Calculate years, months, and remaining days
    const years = Math.floor(diffDays / 365);
    const remainingDays = diffDays % 365;
    const months = Math.floor(remainingDays / 30);
    const days = remainingDays % 30;
    console.log(years, months, days);
    this.duration = {
      years,
      months,
      days,
    };
  }
  next();
}); */

const workExperienceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  experiences: [experienceSchema],
});

const WorkExperience = mongoose.model("workExperience", workExperienceSchema);
export default WorkExperience;
