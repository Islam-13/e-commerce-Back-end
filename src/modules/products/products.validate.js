import joi from "joi";
import { generalFields } from "../../utils/helpers.js";

export const createProduct = {
  body: joi
    .object({
      title: joi.string().min(3).max(30).trim().required(),
      description: joi.string().min(5).required(),
      stock: joi.number().min(1).required(),
      price: joi.number().min(1).required(),
      discount: joi.number().min(1).max(100),
      brandId: generalFields.id.required(),
      categoryId: generalFields.id.required(),
      subCategoryId: generalFields.id.required(),
    })
    .required(),

  files: joi
    .object({
      image: joi.array().items(generalFields.file.required()),
      coverImages: joi.array().items(generalFields.file.required()),
    })
    .required(),
};

export const updateProduct = {
  body: joi
    .object({
      title: joi.string().min(3).max(30).trim(),
      description: joi.string().min(5),
      stock: joi.number().min(1),
      price: joi.number().min(1),
      discount: joi.number().min(1).max(100),
      brandId: generalFields.id.required(),
      categoryId: generalFields.id.required(),
      subCategoryId: generalFields.id.required(),
    })
    .required(),

  files: joi.object({
    image: joi.array().items(generalFields.file),
    coverImages: joi.array().items(generalFields.file),
  }),
};
