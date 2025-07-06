import mongoose from "mongoose";
import bcrypt from "bcrypt";

const employeeSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  sapId: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  location: {
    type: String,
    required: true,
    default: "KDL",
  },
  isSubmitted: {
    type: Boolean,
    default: false,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

employeeSchema.pre("save", async function (next) {
  try {
    if (this.password && this.isModified("password")) {
      this.password = await bcrypt.hash(this.password, 10);
    }
    next();
  } catch (error) {
    return next(error);
  }
});

employeeSchema.methods.checkpw = function (password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model("Employee", employeeSchema);
