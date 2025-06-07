import EducationDetails from "../models/education.js";

const educationDetailsHandler = async (req, res) => {
  try {
    const { education } = req.body;
    const employeeId = req.user.id;

    if (!employeeId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Employee ID missing" });
    }

    console.log("Received Edu details", education);

    const savedEduDetails = await EducationDetails.findOneAndUpdate(
      { employeeId },
      { education, employeeId },
      { new: true, upsert: true }
    );

    res.status(200).json({
      data: savedEduDetails,
      success: true,
      msg: "Education details updated successfully",
    });
  } catch (error) {
    console.log("🚀 ~ educationDetailsHandler ~ error:", error);
    return res
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
    });
  }
};

export { educationDetailsHandler, fetchEducationDetails };
