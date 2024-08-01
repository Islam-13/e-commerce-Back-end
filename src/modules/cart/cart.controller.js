import productModel from "../../../db/models/product.model.js";
import cartModel from "../../../db/models/cart.model.js";
import { asyncHandler } from "../../utils/helpers.js";

export const createCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity } = req.body;

  const product = await productModel.findOne({ _id: productId });
  if (!product) return next(new AppError("Product not found", 404));
  if (product.stock < quantity)
    return next(new AppError("Insufficient stock", 400));

  const cart = await cartModel.findOne({ userId: req.user._id });

  if (!cart) {
    const newCart = await cartModel.create({
      userId: req.user._id,
      products: [{ productId, quantity }],
    });

    return res.status(201).json({ status: "success", newCart });
  }

  let flag;

  for (const product of cart.products) {
    if (product.productId == productId) {
      product.quantity += quantity;
      flag = true;
    }
  }

  if (!flag) cart.products.push({ productId, quantity });

  await cart.save();

  res.status(201).json({ status: "success", cart });
});

export const removeProduct = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  const cart = await cartModel.findOneAndUpdate(
    {
      userId: req.user._id,
      "products.productId": productId,
    },
    { $pull: { products: { productId } } },
    { new: true }
  );

  if (!cart) return next(new AppError("Cart or product not found", 404));

  res.status(200).json({ status: "success", cart });
});

export const clearCart = asyncHandler(async (req, res, next) => {
  const cart = await cartModel.findOneAndUpdate(
    { userId: req.user._id },
    { prodcuts: [] },
    { new: true }
  );

  if (!cart) return next(new AppError("Cart not found", 404));

  res.status(200).json({ status: "success", cart });
});

export const deleteCart = asyncHandler(async (req, res, next) => {
  const { _id } = req.params;

  const cart = await cartModel.findOneAndDelete({ _id, userId: req.user._id });

  res
    .status(201)
    .json({ status: "success", message: "cart deleted successfullt" });
});
