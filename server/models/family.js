import mongoose from "mongoose";

const familyMembersSchema = new mongoose.Schema(
  {
    relationship: {
      type: String,
      enum: [
        "Spouse",
        "Child",
        "Father",
        "Father-in-law",
        "Mother",
        "Mother-in-law",
        "Sister",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      enum: ["Shri", "Smt", "Mt", "Ms"],
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    aadharNumber: {
      type: String,
      required: true,
      match: [
        /^[2-9]{1}[0-9]{11}$/,
        "Aadhaar must be a 12-digit number starting with 2-9",
      ],
    },
    bloodGroup: {
      type: String,
      trim: true,
    },
    dob: {
      type: Date,
      required: true,
      validate: {
        validator: function (v) {
          return v <= new Date();
        },
        message: "Date of Birth cannot be in the future",
      },
    },
    cityOfBirth: {
      type: String,
      trim: true,
    },
    nationality: {
      type: String,
      trim: true,
    },

    // Conditional fields
    gender: {
      type: String,
      enum: ["Male", "Female"],
      required: function () {
        return this.relationship === "Child";
      },
    },
    isWorking: {
      type: Boolean,
      default: false,
      required: function () {
        return this.relationship === "Spouse";
      },
    },
    employmentDetails: {
      type: String,
      required: function () {
        return this.relationship === "Spouse" && this.isWorking === true;
      },
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const familyDetailsSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      unique: true,
    },
    familyMembers: [familyMembersSchema],
  },
  {
    timestamps: true,
  }
);

const FamilyDetails = mongoose.model("familyDetails", familyDetailsSchema);
export default FamilyDetails;
