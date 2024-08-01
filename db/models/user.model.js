import { Schema, model } from "mongoose";
import { systemRoles } from "../../src/utils/helpers.js";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minLength: [3, "Must at least 3 chars"],
      maxLength: [15, "Must AT most 15 chars"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      trim: true,
    },
    confirmed: {
      type: Boolean,
      default: false,
    },
    loggedin: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: Object.values(systemRoles),
      default: "user",
    },
    phone: [String],
    address: [String],
    age: Number,
    otp: String,
    passwordChangedAt: Date,
  },
  { timestamps: true, versionKey: false }
);

const userModel = model("user", userSchema);

export default userModel;
