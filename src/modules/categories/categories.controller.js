import slugify from "slugify";
import categoryModel from "../../../db/models/category.model.js";
import subCategoryModel from "../../../db/models/subCategory.model.js";
import cloudinary, { ApiFeatures, asyncHandler } from "../../utils/helpers.js";
import AppError from "../../utils/appError.js";
import { nanoid } from "nanoid";

export const createCategory = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  const category = await categoryModel.findOne({ name: name.toLowerCase() });
  if (category) return next(new AppError("Category already exists", 409));

  if (!req.file) return next(new AppError("image is required test", 400));

  const customId = nanoid(5);
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    { folder: `e-commerce-app/categories/${customId}` }
  );

  req.filePath = `e-commerce-app/categories/${customId}`;

  const newCategory = await categoryModel.create({
    name,
    slug: slugify(name, { lower: true }),
    image: {
      secure_url,
      public_id,
    },
    createdBy: req.user._id,
    customId: customId,
  });

  req.data = { model: categoryModel, _id: newCategory._id };

  res.status(200).json(newCategory);
});

export const updateCategory = asyncHandler(async (req, res, next) => {
  const { _id } = req.params;
  const { name } = req.body;
  const category = await categoryModel.findOne({
    _id,
    createdBy: req.user._id,
  });
  if (!category) return next(new AppError("Category not found", 404));

  if (name) {
    if (name.toLowerCase() === category.name)
      return next(new AppError("Name should be different", 400));
    if (await categoryModel.findOne({ name: name.toLowerCase() }))
      return next(new AppError("Name already exists", 409));

    category.name = name.toLowerCase();
    category.slug = slugify(name, { lower: true });
  }

  if (req.file) {
    await cloudinary.uploader.destroy(category.image.public_id);

    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `e-commerce-app/categories/${category.customId}`,
      }
    );

    category.image = {
      secure_url,
      public_id,
    };
  }

  await category.save();
  res.status(200).json({ status: "success", category });
});

export const getCategories = asyncHandler(async (req, res, next) => {
  const apiFeatures = new ApiFeatures(categoryModel.find(), req.query)
    .pagination()
    .filter()
    .sort()
    .search()
    .select();

  const categories = await apiFeatures.mongooseQuery;

  !categories
    ? next(new AppError("Failed to get categories", 500))
    : res
        .status(201)
        .json({ status: "success", page: apiFeatures.page, categories });
});

export const getSpecificCategory = asyncHandler(async (req, res, next) => {
  const { _id } = req.params;

  const category = await categoryModel
    .findOne({ _id })
    .populate("subCategories");

  !category
    ? next(new AppError("Category is not exists", 404))
    : res.status(200).json(category);
});

export const deleteCategory = asyncHandler(async (req, res, next) => {
  const { _id } = req.params;

  const category = await categoryModel.findOneAndDelete({
    _id,
    createdBy: req.user._id,
  });

  if (!category) return next(new AppError("Category not found", 404));

  await subCategoryModel.deleteMany({ categoryId: category._id });

  await cloudinary.api.delete_resources_by_prefix(
    `e-commerce-app/categories/${category.customId}`
  );
  await cloudinary.api.delete_folder(
    `e-commerce-app/categories/${category.customId}`
  );

  res
    .status(200)
    .json({ status: "success", message: "Category deleted successfully" });
});
