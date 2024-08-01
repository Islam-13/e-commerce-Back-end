import { Schema, model } from "mongoose";

const orderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "product",
          required: true,
        },
        title: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        finalPrice: { type: Number, required: true },
      },
    ],
    subPrice: { type: Number, required: true },
    couponId: { type: Schema.Types.ObjectId, ref: "coupon" },
    totalPrice: { type: Number, required: true },
    paymentMethod: { type: String, required: true, enum: ["cash", "card"] },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    cancelledBy: { type: Schema.Types.ObjectId, ref: "user" },
    status: {
      type: String,
      required: true,
      enum: ["placed", "deliverd", "rejected", "cancelled", "wait payment"],
      defualt: "placed",
    },
  },
  { timestamps: true, versionKey: false }
);

const orderModel = model("order", orderSchema);

export default orderModel;
