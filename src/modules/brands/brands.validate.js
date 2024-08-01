import joi from "joi";
import { generalFields } from "../../utils/helpers.js";

export const createBrand = {
  body: joi.object({ name: joi.string().min(3).max(15).required() }).required(),
  file: generalFields.file.required(),
};

export const updateBrand = {
  body: joi.object({
    name: joi.string().min(3).max(15),
  }),
  file: generalFields.file,
  params: generalFields.params.required(),
};
