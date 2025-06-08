import FamilyDetails from "../models/family.js";

const familyDetailsHandler = async (req, res) => {
  try {
    const { family } = req.body;
    const employeeId = req.user.id;
    console.log("received family", family);

    if (!employeeId) {
      return res.status(401).json({
        msg: "Unauthorized: Employee ID missing",
        success: false,
        data: null,
      });
    }

    /*   // Transform the data to match the model schema
    const transformedMembers = family.map((member) => ({
      relationship: member.type,
      title: member.title,
      firstName: member.name,
      lastName: member.surname,
      aadharNumber: member.aadharNumber,
      bloodGroup: member.bloodGroup,
      dob: member.dob,
      cityOfBirth: member.cityOfBirth,
      gender: member.gender,
      isWorking: member.isWorking,
      employmentDetails: member.isWorking
        ? member.employmentDetails
        : undefined,
    })); */

    const savedDetails = await FamilyDetails.findOneAndUpdate(
      { employeeId },
      {
        employeeId,
        familyMembers: family,
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      data: savedDetails,
      msg: "Family details updated successfully.",
    });
  } catch (error) {
    console.log("🚀 ~ family details ~ error:", error);
    res
      .status(500)
      .json({ msg: "Internal server error", success: false, data: null });
  }
};

const fetchFamilyDetails = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const familyData = await FamilyDetails.findOne({ employeeId })
      .populate("employeeId", "-__v -_id")
      .select("-__v -_id");

    if (!familyData) {
      return res.status(404).json({
        success: false,
        msg: "No family details found",
        data: null,
      });
    }
    const { employeeId: id, ...familyDetails } = familyData.toObject();
    return res.status(200).json({
      data: familyDetails.familyMembers || [],
      success: true,
      msg: "Data successfully fetched from DB",
    });
  } catch (error) {
    console.log("🚀 ~ fetchFamilyDetails ~ error:", error);

    res.status(500).json({
      success: false,
      msg: "Error in fetching data",
      data: null,
    });
  }
};

export { familyDetailsHandler, fetchFamilyDetails };
