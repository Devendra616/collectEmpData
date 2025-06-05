import express from "express";
import mongoose from "mongoose";

import AddressDetails from "../models/address.js";

const addressDetailsHandler = async (req, res) => {
  try {
    const { currentAddress, permanentAddress } = req.body;
    const employeeId = req.user.id;
    console.log("***", req.body);

    if (!employeeId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Employee ID missing" });
    }

    console.log("Saving address details for employee:", employeeId);
    console.log("Address data:", req.body);

    const savedDetails = await AddressDetails.findOneAndUpdate(
      { employeeId },
      {
        currentAddress,
        permanentAddress,
        employeeId,
        updatedAt: new Date(),
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    console.log("Saved address details:", savedDetails);

    res.status(200).json({
      message: "Address details saved successfully",
      data: savedDetails,
    });
  } catch (error) {
    console.error("Error in addressDetailsHandler:", error);

    // Handle mongoose validation errors
    if (error instanceof mongoose.Error.ValidationError) {
      const validationErrors = {};
      Object.keys(error.errors).forEach((key) => {
        validationErrors[key] = error.errors[key].message;
      });
      return res.status(400).json({
        message: "Validation error",
        errors: validationErrors,
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Duplicate entry found",
        errors: {
          employeeId: "Address details already exist for this employee",
        },
      });
    }

    res.status(500).json({
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export default addressDetailsHandler;
