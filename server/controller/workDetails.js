import WorkExperience from "../models/workExperience.js";
import { getDiffFromDates } from "../utils/getAge.js";

const WorkDetailsHandler = async (req, res) => {
  try {
    const { work: workDetails } = req.body;
    const employeeId = req.user.id;

    if (!employeeId) {
      return res.status(401).json({
        msg: "Unauthorized: Employee ID missing",
        success: false,
        data: null,
      });
    }

    // Transform the data to match the schema
    const transformedWorkDetails = workDetails.map((exp) => {
      const duration = getDiffFromDates(exp.startDate, exp.relievingDate);
      console.log("🚀 ~ transformedWorkDetails ~ duration:", duration);

      return {
        ...exp,
        duration: {
          years: duration.years || 0,
          months: duration.months || 0,
          days: duration.days || 0,
        },
      };
    });

    // Log the update operation data
    console.log("Update operation data:", { ...transformedWorkDetails });

    const savedWorkDetails = await WorkExperience.findOneAndUpdate(
      { employeeId },
      { $set: { experiences: transformedWorkDetails } },
      { new: true, upsert: true }
    );

    console.log(
      "🚀 ~ WorkDetailsHandler ~ savedWorkDetails:",
      savedWorkDetails
    );
    res.status(200).json({
      success: true,
      data: savedWorkDetails,
      msg: "Work details updated successfully.",
    });
  } catch (error) {
    console.log("🚀 ~ WorkDetailsHandler ~ error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const fetchWorkDetails = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const workExpDetails = await WorkExperience.findOne({ employeeId })
      .populate("employeeId", "-__v -_id")
      .select("-__v -_id");

    if (!workExpDetails) {
      return res.status(404).json({
        success: false,
        msg: "No work experiences found",
        data: null,
      });
    }
    const { employeeId: id, ...workDetails } = workExpDetails.toObject();
    console.log("🚀 ~ fetchWorkDetails ~ workDetails:", workDetails);
    return res.status(200).json({
      data: workDetails.experiences || [],
      success: true,
      msg: "Data successfully fetched from DB",
    });
  } catch (error) {
    console.log("🚀 ~ fetch work details ~ error:", error);
    res.status(500).json({
      success: false,
      msg: "Error in fetching data",
      data: null,
    });
  }
};

export { WorkDetailsHandler, fetchWorkDetails };
