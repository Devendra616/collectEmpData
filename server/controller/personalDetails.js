import express from "express";
import mongoose from "mongoose";

import PersonalDetails from "../models/personalDetails.js";

const personalDetailsHandler = async (req, res) => {
  try {
    const personalDetails = req.body;

    const employeeId = req.user.id;

    if (!employeeId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Employee ID missing" });
    }

    console.log(req.body);
    console.log("Received Personal Details:", personalDetails);

    const savedDetails = await PersonalDetails.findOneAndUpdate(
      { employeeId },
      { ...personalDetails, employeeId },
      { new: true, upsert: true }
    );
    console.log("After update", savedDetails);
    res.status(200).json({
      data: [savedDetails],
      success: true,
      msg: "Updated personal details",
    });
  } catch (error) {
    console.log("🚀 ~ personalDetailsHandler ~ error:", error);
    return res
      .status(500)
      .json({ msg: "Internal server error", success: false, data: null });
  }
};

const fetchPersonalDetails = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const personalData = await PersonalDetails.findOne({ employeeId })
      .populate("employeeId", "-__v -_id")
      .select("-__v -_id");

    if (!personalData) {
      return res.status(404).json({
        success: false,
        msg: "No personal details found",
      });
    }

    const { employeeId: id, ...personalDetails } = personalData.toObject();
    return res.status(200).json({
      data: [
        {
          ...personalDetails,
          email: id.email,
          sapId: id.sapId,
          langHindiRead: personalDetails.langHindiRead || false,
          langHindiWrite: personalDetails.langHindiWrite || false,
          langHindiSpeak: personalDetails.langHindiSpeak || false,
        },
      ],
      success: true,
      msg: "Data successfully fetched from DB",
    });
  } catch (error) {
    console.log("🚀 ~ fetchPersonalDetails ~ error:", error);
    res.status(500).json({
      success: false,
      msg: "Error in fetching data",
    });
  }
};

export { personalDetailsHandler, fetchPersonalDetails };
