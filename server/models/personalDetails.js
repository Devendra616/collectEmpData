import mongoose from "mongoose";

const personalDetailsSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Types.ObjectId,
    ref: "Employee",
  },
  title: String,
  firstName: String,
  lastName: String,
  // sapId: String,
  gender: String,
  dob: Date,
  mobile: String,
  // email: String,
  adhaarId: String,
  birthplace: String,
  state: String,
  religion: String,
  category: String,
  subCategory: String,
  idMark1: String,
  idMark2: String,
  exServiceman: String,
  isDisabled: Boolean,
  motherTongue: String,
  otherMotherTongue: String,
  hindiKnowledge: String,
  langHindiRead: Boolean,
  langHindiWrite: Boolean,
  langHindiSpeak: Boolean,
  pwd: String,
});

const PersonalDetails = mongoose.model(
  "PersonalDetails",
  personalDetailsSchema
);

export default PersonalDetails;
