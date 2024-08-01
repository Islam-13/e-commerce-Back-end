import Joi from "joi";
import { generalFields } from "../../utils/helpers.js";

export const createOrder = {
  body: Joi.object({
    productId: generalFields.id,
    quantity: Joi.number().integer().positive(),
    paymentMethod: Joi.string().valid("cash", "card"),
    address: Joi.string().required(),
    phone: Joi.string().required(),
    couponCode: Joi.string().min(3),
  }),
};

export const cancelOrder = {
  params: Joi.object({
    _id: generalFields.id.required(),
  }),
};
