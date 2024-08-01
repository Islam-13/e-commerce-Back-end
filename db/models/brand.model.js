import { Schema, model } from "mongoose";

const brandSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      unique: true,
      required: [true, "Name is required"],
      lowercase: true,
      minLength: [3, "Must at least 3 chars"],
      maxLength: [15, "Must AT most 15 chars"],
    },
    slug: {
      type: String,
      trim: true,
      unique: true,
      minLength: [3, "Must at least 3 chars"],
      maxLength: [15, "Must AT most 15 chars"],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    image: {
      secure_url: String,
      public_id: String,
    },
    customId: String,
  },
  { timestamps: true, versionKey: false },
);

const brandModel = model("brand", brandSchema);

export default brandModel;
