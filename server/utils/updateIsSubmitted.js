/* 
A script to update all Employee documents in the MongoDB collection where the isSubmitted field is missing, setting it to false. This is a common migration task when a new field is added to a schema after some documents have already been created.
*/
import mongoose from "mongoose";
import Employee from "../models/employee.js";
import dotenv from "dotenv";
dotenv.config();
const MONGODB_URI = process.env.MONGO_URL;

async function updateIsSubmitted() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Update all employees where isSubmitted is missing (i.e., does not exist)
    const result = await Employee.updateMany(
      { isSubmitted: { $exists: false } },
      { $set: { isSubmitted: false } }
    );

    console.log(
      `Updated ${result.nModified || result.modifiedCount} employees.`
    );
    await mongoose.disconnect();
  } catch (err) {
    console.error("Error updating employees:", err);
    process.exit(1);
  }
}

updateIsSubmitted();
