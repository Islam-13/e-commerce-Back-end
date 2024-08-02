import Stripe from "stripe";
import cartModel from "../../../db/models/cart.model.js";
import couponModel from "../../../db/models/coupon.model.js";
import orderModel from "../../../db/models/order.model.js";
import productModel from "../../../db/models/product.model.js";
import sendEmail from "../../services/sendEmail.js";
import AppError from "../../utils/appError.js";
import { asyncHandler } from "../../utils/helpers.js";
import { createInvoice } from "../../utils/pdf.js";
import cardPayment from "../../services/cardPayment.js";

export const createOrder = asyncHandler(async (req, res, next) => {
  const { couponCode, productId, quantity, paymentMethod, address, phone } =
    req.body;

  if (couponCode) {
    const coupon = await couponModel.findOne({
      code: couponCode.toLowercase(),
      usedBy: { $nin: [req.user._id] },
    });

    if (!coupon || coupon.endDate < Date.now())
      return next(
        new AppError(
          "Coupon does not exist or has expired or already used",
          400
        )
      );

    req.body.coupon = coupon;
  }

  let products = [];
  let flag;

  if (productId) {
    products = [{ productId, quantity }];
  } else {
    const cart = await cartModel.findOne({ userId: req.user._id });
    if (!cart || !cart.products.length)
      return next(new AppError("Cart is not exist or empty", 400));

    products = cart.products;
    flag = true;
  }

  let finalProducts = [];
  let subPrice = 0;

  for (let product of products) {
    const checkProduct = await productModel.findOne({
      _id: product.productId,
      stock: { $gte: product.quantity },
    });
    if (!checkProduct)
      return next(new AppError("Product is not exist or out of stock", 400));

    if (flag) product = product.toObject();

    product.title = checkProduct.title;
    product.price = checkProduct.subPrice;
    product.finalPrice = checkProduct.subPrice * product.quantity;
    subPrice += product.finalPrice;

    finalProducts.push(product);
  }

  const order = await orderModel.create({
    userId: req.user._id,
    products: finalProducts,
    subPrice,
    couponId: req.body?.coupon?._id,
    totalPrice: subPrice - (subPrice * (req.body.coupon?.amount || 0)) / 100,
    paymentMethod,
    address,
    phone,
    status: paymentMethod == "cash" ? "placed" : "wait payment",
  });

  req.data = { model: orderModel, _id: order._id };

  if (req.body?.coupon) {
    await couponModel.updateOne(
      { code: couponCode.toLowerCase() },
      { $push: { usedBy: req.user._id } }
    );
  }

  for (const product of finalProducts) {
    await productModel.updateOne(
      { _id: product.productId },
      { $inc: { stock: -product.quantity } }
    );
  }

  await cartModel.updateOne({ userId: req.user._id }, { products: [] });

  //create pdf invocie
  const invoice = {
    shipping: {
      name: req.user.name,
      address: req.user.address,
      city: "Alexandria",
      state: "CA",
      country: "Egypt",
      postal_code: 94111,
    },
    items: order.products,
    subtotal: order.subPrice,
    paid: order.totalPrice,
    invoice_nr: order._id,
    date: order.createdAt,
    discount: req.body?.coupon || 0,
  };

  await createInvoice(invoice, `invoice-${order._id}.pdf`);

  if (paymentMethod == "card") {
    const stripe = new Stripe(process.env.stripe_key);

    if (req.body?.coupon) {
      const coupon = await stripe.coupons.create({
        percent_off: req.body.coupon.amount,
        duration: "once",
      });

      req.body.coupon = coupon.id;
    }

    const paymentData = {
      stripe,
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: req.user.email,
      metadata: {
        orderId: order._id.toString(),
        products: JSON.stringify(order.products),
        invoice: `invoice-${order._id}.pdf`,
        couponId: req.body?.coupon ? req.body.coupon._id : null,
        usedBy: req.user._id.toString(),
        email: req.user.email,
      },
      success_url: `${req.protocol}://${req.headers.host}/orders/success/${order._id}`,
      cancel_url: `${req.protocol}://${req.headers.host}/orders/cancel/${order._id}`,
      line_items: order.products.map((product) => {
        return {
          price_data: {
            currency: "EGP",
            product_data: {
              name: product.title,
            },
            unit_amount: product.price * 100,
          },
          quantity: product.quantity,
        };
      }),
      discounts: req.body?.coupon ? [{ coupon: req.body.couponId }] : [],
    };

    const session = await cardPayment(paymentData);

    return res.status(201).json({ status: "success", url: session.url, order });
  }

  await sendEmail(req.user.email, "order invoice", "", [
    { path: `invoice-${order._id}.pdf`, contentType: "application/pdf" },
  ]);

  res.status(201).json({ status: "success", order });
});

export const cancelOrder = asyncHandler(async (req, res, next) => {
  const { _id } = req.params;

  const order = await orderModel.findOne({ _id, userId: req.user._id });
  if (!order) return next(new AppError("Order is not exist or not yours", 400));

  if (
    (order.paymentMethod === "cash" && order.status != "placed") ||
    (order.paymentMethod === "card" && order.status != "wait payment")
  )
    return next(new AppError("Order can't be cancelled", 400));

  await orderModel.updateOne(
    { _id, userId: req.user._id },
    { status: "cancelled", cancelledBy: req.user._id }
  );

  if (order.couponId) {
    await couponModel.updateOne(
      { _id: order.couponId },
      { $pull: { usedBy: req.user._id } }
    );
  }

  for (const product of order.products) {
    await productModel.updateOne(
      { _id: product.productId },
      { $inc: { stock: product.quantity } }
    );
  }

  res
    .status(200)
    .json({ status: "success", message: "Order cancelled successfully" });
});

export const webhook = asyncHandler(async (req, res, next) => {
  const stripe = new Stripe(process.env.stripe_key);
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.endpointSecret
    );
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  const { orderId, products, couponId, usedBy, email, invoice } =
    event.data.object.metadata;
  if (event.type != "checkout.session.completed") {
    // const orderProducts = JSON.parse(products);

    await orderModel.updateOne({ _id: orderId }, { status: "rejected" });

    // if (couponId) {
    //   await couponModel.updateOne({ _id: couponId }, { $pull: { usedBy } });
    // }

    // for (const product of orderProducts) {
    //   await productModel.updateOne(
    //     { _id: product.productId },
    //     { $inc: { stock: product.quantity } }
    //   );
    // }

    return next(new AppError("payment rejected", 401));
  }

  await orderModel.updateOne({ _id: orderId }, { status: "placed" });

  // await sendEmail(email, "order invoice", "", [
  //   { path: invoice, contentType: "application/pdf" },
  // ]);

  res.status(201).json({ message: "payment success" });
});

export const test = asyncHandler(async (req, res, next) => {
  const stripe = new Stripe(process.env.stripe_key);
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.endpointSecret
    );
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  const { orderId } = event.data.object.metadata;
  if (event.type != "checkout.session.completed") {
    await orderModel.updateOne({ _id: orderId }, { status: "rejected" });

    return res.status(400).json({ message: "failed" });
  }

  await orderModel.updateOne({ _id: orderId }, { status: "placed" });

  return res.status(200).json({ message: "success" });
});
