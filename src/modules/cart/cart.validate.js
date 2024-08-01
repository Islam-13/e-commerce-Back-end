import Joi from "joi";

export const createCart = {
  body: Joi.object({
    productId: Joi.string().required(),
    quantity: Joi.number().integer().min(1).required(),
  }),
};
