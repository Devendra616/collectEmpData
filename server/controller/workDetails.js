import WorkExperience from "../models/workExperience.js";

const WorkDetailsHandler = async (req, res) => {
  try {
    const workDetails = req.body;
    const employeeId = req.user.id;

    if (!employeeId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Employee ID missing" });
    }

    // Transform the data to match the schema
    const transformedWorkDetails = workDetails.map((exp) => ({
      companyName: exp.name,
      role: exp.designation,
      startDate: exp.startDate,
      endDate: exp.relievingDate,
      duration: {
        years: exp.numberOfYears || 0,
        months: exp.numberOfMonths || 0,
        days: 0,
      },
      grossSalary: exp.grossSalary,
      city: exp.city,
      industry: exp.industry,
      greenfield: exp.greenfield === "Yes",
      reasonForLeaving: exp.reasonForLeaving,
      scaleOnLeaving: exp.scaleOnLeaving,
      responsibilities: exp.responsibilities || "",
    }));

    // Find existing work experience or create new
    let workExperience = await WorkExperience.findOne({ employeeId });

    if (workExperience) {
      // Update existing document
      workExperience.experiences = transformedWorkDetails;
    } else {
      // Create new document
      workExperience = new WorkExperience({
        employeeId,
        experiences: transformedWorkDetails,
      });
    }

    // Save the document to trigger pre-save middleware
    const savedWorkDetails = await workExperience.save();

    res.status(200).json({
      success: true,
      savedWorkDetails,
      msg: "Work details saved successfully.",
      statusCode: 200,
    });
  } catch (error) {
    console.log("🚀 ~ WorkDetailsHandler ~ error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default WorkDetailsHandler;
