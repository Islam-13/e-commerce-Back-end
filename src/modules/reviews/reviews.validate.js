import Joi from "joi";
import { generalFields } from "../../utils/helpers.js";

export const createReview = {
  body: Joi.object({
    rate: Joi.number().min(1).max(5).integer().required(),
    comment: Joi.string().required(),
  }).required(),
  params: Joi.object({
    productId: generalFields.id.required(),
  }),
};

export const deleteReview = {
  params: generalFields.params.required(),
};
