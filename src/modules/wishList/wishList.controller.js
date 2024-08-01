import productModel from "../../../db/models/product.model.js";
import wishListModel from "../../../db/models/wishList.model.js";
import AppError from "../../utils/appError.js";
import { asyncHandler } from "../../utils/helpers.js";

export const createWishList = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  const product = await productModel.findById(productId);
  if (!product) return next(new AppError("Product not found", 404));

  const wishList = await wishListModel.findOneAndUpdate(
    { userId: req.user._id },
    { $addToSet: { products: productId } },
    { new: true }
  );

  if (!wishList) {
    await wishListModel.create({ userId: req.user._id, products: [productId] });
  }

  res.status(201).json({ status: "success" });
});
