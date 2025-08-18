import EducationDetails from "../models/education.js";

const educationDetailsHandler = async (req, res) => {
  try {
    const { education } = req.body;

    const employeeId = req.user.id;

    if (!employeeId) {
      return res.status(401).json({
        msg: "Unauthorized: Employee ID missing",
        success: false,
        data: null,
      });
    }

    // Debug logging for grade fields
    if (education && Array.isArray(education)) {
      education.forEach((entry, index) => {
        if (entry.grade !== undefined) {
          console.log(
            `Received education entry ${index} grade:`,
            entry.grade,
            "Type:",
            typeof entry.grade
          );
          // Ensure grade is always a string
          education[index].grade = String(entry.grade);
          console.log(
            `After conversion - education entry ${index} grade:`,
            education[index].grade,
            "Type:",
            typeof education[index].grade
          );
        }
      });
    }

    // console.log(req.body)
    console.log("Received Edu details", education);
    // console.log(req.body.education)

    const savedEduDetails = await EducationDetails.findOneAndUpdate(
      { employeeId },
      { education, employeeId },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      data: savedEduDetails,
      msg: "Education details updated successfully.",
    });
  } catch (error) {
    console.log("🚀 ~ educationDetailsHandler ~ error:", error);
    res
      .status(500)
      .json({ msg: "Internal server error", success: false, data: null });
  }
};

const fetchEducationDetails = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const educationData = await EducationDetails.findOne({ employeeId })
      .populate("employeeId", "-__v -_id")
      .select("-__v -_id");

    if (!educationData) {
      return res.status(404).json({
        success: false,
        msg: "No education details found",
        data: null,
      });
    }

    // Debug logging for grade fields
    if (educationData.education && Array.isArray(educationData.education)) {
      educationData.education.forEach((entry, index) => {
        if (entry.grade !== undefined) {
          console.log(
            `Retrieved education entry ${index} grade:`,
            entry.grade,
            "Type:",
            typeof entry.grade
          );
          // Ensure grade is always a string
          educationData.education[index].grade = String(entry.grade);
          console.log(
            `After conversion - retrieved education entry ${index} grade:`,
            educationData.education[index].grade,
            "Type:",
            typeof educationData.education[index].grade
          );
        }
      });
    }

    const { employeeId: id, ...educationDetails } = educationData.toObject();
    return res.status(200).json({
      data: educationDetails.education || [],
      success: true,
      msg: "Data successfully fetched from DB",
    });
  } catch (error) {
    console.log("🚀 ~ fetchEducationDetails ~ error:", error);
    res.status(500).json({
      success: false,
      msg: "Error in fetching data",
      data: null,
    });
  }
};

export { educationDetailsHandler, fetchEducationDetails };
