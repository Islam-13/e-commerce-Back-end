import Joi from "joi";
import { generalFields } from "../../utils/helpers.js";

export const createWishList = {
  params: Joi.object({
    productId: generalFields.id.required(),
  }),
};
