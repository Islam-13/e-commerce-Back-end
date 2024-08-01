import couponModel from "../../../db/models/coupon.model.js";
import AppError from "../../utils/appError.js";
import { asyncHandler } from "../../utils/helpers.js";

export const createCoupon = asyncHandler(async (req, res, next) => {
  const { code } = req.body;

  const coupon = await couponModel.findOne({ code });
  if (coupon) return next(new AppError("Coupon already exists", 400));

  const newCoupon = await couponModel.create({
    ...req.body,
    createdBy: req.user._id,
  });

  !newCoupon
    ? next(new AppError("Failed to create coupon", 500))
    : res.status(201).json({ status: "success", newCoupon });
});

export const getCoupons = asyncHandler(async (req, res, next) => {
  const coupons = await couponModel.find();

  !coupons
    ? next(new AppError("Failed to get coupons", 500))
    : res.status(200).json({ status: "success", coupons });
});

export const getCoupon = asyncHandler(async (req, res, next) => {
  const { _id } = req.params;
  const coupon = await couponModel.findById(_id);

  !coupon
    ? next(new AppError("Coupon not found", 404))
    : res.status(200).json({ status: "success", coupon });
});

export const deleteCoupon = asyncHandler(async (req, res, next) => {
  const { _id } = req.params;

  const coupon = await couponModel.findOneAndDelete({
    _id,
    createdBy: req.user._id,
  });

  !coupon
    ? next(new AppError("Coupon not found", 404))
    : res
        .status(200)
        .json({ status: "success", message: "Coupon deleted successfully" });
});

export const updateCoupon = asyncHandler(async (req, res, next) => {
  const { _id } = req.params;

  const coupon = await couponModel.findOneAndUpdate(
    { _id, createdBy: req.user._id },
    req.body,
    { new: true }
  );

  !coupon
    ? next(new AppError("Coupon not found", 404))
    : res
        .status(200)
        .json({ status: "success", message: "Coupon updated successfully" });
});
