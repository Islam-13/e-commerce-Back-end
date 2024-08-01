import orderModel from "../../../db/models/order.model.js";
import productModel from "../../../db/models/product.model.js";
import reviewModel from "../../../db/models/review.model.js";
import AppError from "../../utils/appError.js";
import { asyncHandler } from "../../utils/helpers.js";

export const createReview = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  const product = await productModel.findById(productId);
  if (!product) return next(new AppError("Product is not exist", 404));

  const review = await reviewModel.findOne({ productId, userId: req.user._id });
  if (review)
    return next(new AppError("You already reviewed this product", 400));

  const order = await orderModel.findOne({
    userId: req.user._id,
    "products.productId": productId,
    status: "deliverd",
  });
  if (!order)
    return next(
      new AppError("Order isn't exist or you didn't order this product", 404)
    );

  const newReview = await reviewModel.create({
    ...req.body,
    productId,
    userId: req.user._id,
  });

  let sum = product.rateAvg * product.rateNum;
  sum += newReview.rate;

  product.rateNum += 1;
  product.rateAvg = sum / (product.rateNum + 1);

  await product.save();

  res.status(201).json({ status: "success", newReview });
});

export const deleteReview = asyncHandler(async (req, res, next) => {
  const { _id } = req.params;
  const review = await reviewModel.findOneAndDelete({
    _id,
    userId: req.user._id,
  });
  if (!review) return next(new AppError("Review is not exist", 404));

  const product = await productModel.findById(review.productId);

  let sum = product.rateAvg * product.rateNum;
  sum -= review.rate;

  product.rateNum -= 1;
  product.rateAvg = sum / (product.rateNum - 1);

  await product.save();

  res
    .status(201)
    .json({ status: "success", message: "Review deleted successfully" });
});
