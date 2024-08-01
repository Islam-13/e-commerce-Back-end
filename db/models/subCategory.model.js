import { Schema, model } from "mongoose";

const subCategorySchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      unique: true,
      required: [true, "Name is required"],
      lowercase: true,
      minLength: [3, "Must at least 3 chars"],
      maxLength: [15, "Must at most 15 chars"],
    },
    slug: {
      type: String,
      trim: true,
      unique: true,
      minLength: [3, "Must at least 3 chars"],
      maxLength: [15, "Must at most 15 chars"],
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
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "category",
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

const subCategoryModel = model("subCategory", subCategorySchema);

export default subCategoryModel;
