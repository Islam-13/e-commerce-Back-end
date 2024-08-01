import { Types } from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import joi from "joi";

export const objectIdValidation = (value, helper) => {
  return Types.ObjectId.isValid(value) ? ture : helper.message("Invalid Id");
};

export const paramsIdValidation = (value, helper) => {
  return Types.ObjectId.isValid(value)
    ? value
    : helper.message("Invalid params Id");
};

export const systemRoles = {
  admin: "admin",
  user: "user",
};

export const asyncHandler = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => next(err));
  };
};

cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
});

export default cloudinary;

export const generalFields = {
  id: joi.string().custom(paramsIdValidation),
  file: joi.object({
    size: joi.number().positive().required(),
    path: joi.string().required(),
    filename: joi.string().required(),
    destination: joi.string().required(),
    mimetype: joi.string().required(),
    encoding: joi.string().required(),
    originalname: joi.string().required(),
    fieldname: joi.string().required(),
  }),
  headers: joi.object({}),
  params: joi.object({
    _id: joi.string().custom(paramsIdValidation),
    categoryId: joi.string().custom(paramsIdValidation),
  }),
};

export const paramsId = {
  params: joi
    .object({
      _id: joi.string().custom(paramsIdValidation),
      categoryId: joi.string().custom(paramsIdValidation),
    })
    .required(),
};

export const globalErrorHandler = (err, req, res, next) => {
  res
    .status(err.statusCode || 400)
    .json({ status: "error", message: err.message });

  if (req.filePath || req.data) next();
};

export const deleteFromCloudinary = async (req, res, next) => {
  if (req.filePath) {
    await cloudinary.api.delete_resources_by_prefix(req.filePath);
    await cloudinary.api.delete_folder(req.filePath);
  }

  if (req.data) next();
};

export const deleteFromDb = async (req, res, next) => {
  const { model, _id } = req.data;

  await model.findByIdAndDelete(_id);
};

export class ApiFeatures {
  constructor(mongooseQuery, queryString) {
    this.mongooseQuery = mongooseQuery;
    this.queryString = queryString;
  }

  pagination() {
    let page = this.queryString?.page * 1 || 1;
    if (page < 1) page = 1;
    let limit = 10;
    let skip = (page - 1) * limit;

    this.mongooseQuery.find().skip(skip).limit(limit);
    this.page = page;
    return this;
  }

  filter() {
    let excludeQuery = ["page", "sort", "search", "select"];
    let filterQuery = { ...this.queryString };
    excludeQuery.forEach((query) => delete filterQuery[query]);
    filterQuery = JSON.parse(
      JSON.stringify(filterQuery).replace(/(gt,gte,lt,lte)/, (el) => `$${el}`)
    );

    this.mongooseQuery.find(filterQuery);
    return this;
  }

  sort() {
    if (this.queryString.sort)
      this.mongooseQuery.sort(this.queryString.sort.replaceAll(",", " "));
    return this;
  }

  select() {
    if (this.queryString.select)
      this.mongooseQuery.select(this.queryString.select.replaceAll(",", " "));
    return this;
  }

  search() {
    if (this.queryString.search)
      this.mongooseQuery.find({
        $or: [
          { title: { $regex: this.queryString.search, $options: "i" } },
          { description: { $regex: this.queryString.search, $options: "i" } },
        ],
      });
    return this;
  }
}
