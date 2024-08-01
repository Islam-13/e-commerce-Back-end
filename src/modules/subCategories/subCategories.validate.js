import joi from "joi";
import { generalFields } from "../../utils/helpers.js";

// export const createSubCategory = {
//   body: joi.object({ name: joi.string().min(3).max(15).required() }).required(),
//   file: generalFields.file.required(),
//   params: generalFields.params.required(),
// };

export const updateSubCategory = {
  body: joi.object({ name: joi.string().min(3).max(15) }).required(),
  file: generalFields.file,
  params: generalFields.params.required(),
};

export const createSubCategory = {
  body: joi.object({ name: joi.string().min(3).max(15).required() }).required(),
};
