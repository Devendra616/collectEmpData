import express from "express";
import mongoose from "mongoose";

import AddressDetails from "../models/address.js";

const addressDetailsHandler = async (req, res) => {
  try {
    const { address } = req.body;
    const employeeId = req.user.id;

    if (!employeeId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Employee ID missing" });
    }

    // Transform the address array to match the model schema
    const presentAddress = address.find((addr) => addr.type === "present");
    const permanentAddress = address.find((addr) => addr.type === "permanent");

    if (!presentAddress || !permanentAddress) {
      return res.status(400).json({
        success: false,
        message: "Both present and permanent addresses are required",
        data: null,
      });
    }

    // Remove the type field before saving
    const { type: _, ...presentAddressData } = presentAddress;
    const { type: __, ...permanentAddressData } = permanentAddress;

    console.log("Saving address details for employee:", employeeId);
    console.log("Address data:", {
      presentAddress: presentAddressData,
      permanentAddress: permanentAddressData,
    });

    const savedDetails = await AddressDetails.findOneAndUpdate(
      { employeeId },
      {
        presentAddress: presentAddressData,
        permanentAddress: permanentAddressData,
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
      success: true,
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
        success: false,
        message: "Validation error",
        errors: validationErrors,
        data: null,
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate entry found",
        errors: {
          employeeId: "Address details already exist for this employee",
        },
        data: null,
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
      data: null,
    });
  }
};

const fetchAddressDetails = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const addressData = await AddressDetails.findOne({ employeeId })
      .populate("employeeId", "-__v -_id")
      .select("-__v -_id");

    if (!addressData) {
      return res.status(404).json({
        success: false,
        msg: "No address details found",
        data: null,
      });
    }

    // Transform the data to match the expected format
    const { employeeId: id, ...addressDetails } = addressData.toObject();
    const formattedAddress = [
      {
        type: "present",
        ...addressDetails.presentAddress,
      },
      {
        type: "permanent",
        ...addressDetails.permanentAddress,
      },
    ];
    console.log("formatted Address", formattedAddress);
    return res.status(200).json({
      data: formattedAddress,
      success: true,
      msg: "Data successfully fetched from DB",
    });
  } catch (error) {
    console.log("🚀 ~ fetchAddressDetails ~ error:", error);
    res.status(500).json({
      success: false,
      msg: "Error in fetching data",
      data: null,
    });
  }
};

export { addressDetailsHandler, fetchAddressDetails };
