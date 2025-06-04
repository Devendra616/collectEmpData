import express from "express";
import mongoose from "mongoose";

import FamilyDetails from "../models/family.js";

const familyDetailsHandler = async (req, res) => {
  try {
    const familyMembers = req.body;
    const employeeId = req.user.id;
    console.log("received familymembers", familyMembers);

    if (!employeeId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Employee ID missing" });
    }

    // Validate if familyMembers is an array
    if (!Array.isArray(familyMembers)) {
      return res.status(400).json({
        message: "Invalid data format: family members must be an array",
      });
    }

    // Transform the data to match the model schema
    const transformedMembers = familyMembers.map((member) => ({
      relationship: member.type,
      title: member.title,
      firstName: member.name,
      lastName: member.surname,
      aadharNumber: member.aadharNumber,
      bloodGroup: member.bloodGroup,
      dob: member.dob,
      cityOfBirth: member.cityOfBirth,
      gender: member.gender,
      isWorking: member.employmentStatus === "Working",
      employmentDetails:
        member.employmentStatus === "Working"
          ? member.employmentDetails
          : undefined,
    }));

    const savedDetails = await FamilyDetails.findOneAndUpdate(
      { employeeId },
      {
        employeeId,
        familyMembers: transformedMembers,
      },
      { new: true, upsert: true }
    );

    res.status(200).json(savedDetails);
  } catch (error) {
    console.log("🚀 ~ family details ~ error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default familyDetailsHandler;
