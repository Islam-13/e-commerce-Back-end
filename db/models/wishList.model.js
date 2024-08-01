import { Schema, model } from "mongoose";

const wishListSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
    ],
  },
  { timestamps: true, versionKey: false }
);

const wishListModel = model("wishList", wishListSchema);

export default wishListModel;
