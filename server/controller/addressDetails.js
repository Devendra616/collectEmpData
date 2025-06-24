import express from "express";
import mongoose from "mongoose";

import AddressDetails from "../models/address.js";

const addressDetailsHandler = async (req, res) => {
  try {
    const { address } = req.body;
    const employeeId = req.user.id;

    if (!employeeId) {
      return res.status(401).json({
        msg: "Unauthorized: Employee ID missing",
        success: false,
        data: null,
      });
    }

    // Transform the address array to match the model schema
    const presentAddress = address.find((addr) => addr.type === "present");
    console.log("🚀 ~ addressDetailsHandler ~ presentAddress:", presentAddress);
    const permanentAddress = address.find((addr) => addr.type === "permanent");
    const correspondenceAddress = address.find(
      (addr) => addr.type === "correspondence"
    );
    console.log(
      "🚀 ~ addressDetailsHandler ~ correspondenceAddress:",
      correspondenceAddress
    );

    if (!presentAddress || !permanentAddress) {
      return res.status(400).json({
        success: false,
        msg: "Present, Permanent and Correspondence addresses are required",
        data: null,
      });
    }

    // Remove the type field before saving
    const { type: _, ...presentAddressData } = presentAddress;
    const { type: __, ...permanentAddressData } = permanentAddress;
    const { type: ___, ...correspondenceAddressData } =
      correspondenceAddress || {};

    // Helper to check if all fields are blank
    function isAddressEmpty(addr) {
      if (!addr) return true;
      const fields = Object.keys(addr).filter((k) => k !== "type");
      return (
        fields.length === 0 ||
        fields.every((k) => !addr[k] || addr[k].toString().trim() === "")
      );
    }
    const correspondenceToSave = !isAddressEmpty(correspondenceAddressData)
      ? correspondenceAddressData
      : undefined;
    console.log("--------", correspondenceToSave);
    const savedDetails = await AddressDetails.findOneAndUpdate(
      { employeeId },
      {
        presentAddress: presentAddressData,
        permanentAddress: permanentAddressData,
        correspondenceAddress: correspondenceToSave,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    const {
      _id,
      __v,
      employeeId: emp,
      ...cleanedResult
    } = savedDetails.toObject();

    res.status(200).json({
      success: true,
      msg: "Address details saved successfully",
      data: cleanedResult,
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
        msg: "Validation error",
        errors: validationErrors,
        data: null,
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        msg: "Duplicate entry found",
        errors: {
          employeeId: "Address details already exist for this employee",
        },
        data: null,
      });
    }

    res.status(500).json({
      success: false,
      msg: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.msg : undefined,
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
      {
        type: "correspondence",
        ...addressDetails.correspondenceAddress,
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
