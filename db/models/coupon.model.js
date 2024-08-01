import { Schema, model } from "mongoose";

const couponSchema = new Schema(
  {
    code: {
      type: String,
      unique: true,
      lowercase: true,
      required: true,
      minLength: 3,
      maxLength: 15,
    },
    amount: {
      type: Number,
      min: 1,
      max: 100,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    usedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

const couponModel = model("coupon", couponSchema);

export default couponModel;
