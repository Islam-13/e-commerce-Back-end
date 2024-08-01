import { Schema, model } from "mongoose";

const productSchema = new Schema(
  {
    title: {
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
    description: {
      type: String,
      trim: true,
      minLength: [5, "Must at least 5 chars"],
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "category",
      required: true,
    },
    subCategoryId: {
      type: Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true,
    },
    brandId: {
      type: Schema.Types.ObjectId,
      ref: "brand",
      required: true,
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
    coverImages: [
      {
        secure_url: String,
        public_id: String,
      },
    ],
    price: {
      type: Number,
      required: true,
      min: [1, "Price must be greater than 1"],
    },
    discount: {
      type: Number,
      defualt: 1,
      min: [1, "Discount must be greater than 1"],
      max: [100, "Discount must be less than 100"],
    },
    subPrice: {
      type: Number,
      default: 1,
    },
    stock: {
      type: Number,
      min: [1, "SubPrice must be greater than 1"],
      requried: true,
    },
    rateAvg: {
      type: Number,
      default: 0,
    },
    rateNum: {
      type: Number,
      default: 0,
    },

    customId: String,
  },
  { timestamps: true, versionKey: false }
);

const productModel = model("product", productSchema);

export default productModel;
