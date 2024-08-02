import slugify from "slugify";
import { nanoid } from "nanoid";
import categoryModel from "../../../db/models/category.model.js";
import subCategoryModel from "../../../db/models/subCategory.model.js";
import cloudinary, { ApiFeatures, asyncHandler } from "../../utils/helpers.js";
import AppError from "../../utils/appError.js";

export const createSubCategory = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  const { categoryId } = req.params;

  const category = await categoryModel.findById(categoryId);
  if (!category) return next(new Error("Category does not exist", 404));

  const subCategory = await subCategoryModel.findOne({
    name: name.toLowerCase(),
  });
  if (subCategory) return next(new Error("Sub category already exists", 409));

  if (!req.file) return next(new AppError("Image is required", 400));

  const customId = nanoid(5);

  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `e-commerce-app/categories/${category.customId}/subCategories/${customId}`,
    }
  );

  req.filePath = `e-commerce-app/categories/${category.customId}/subCategories/${customId}`;

  const newSubCategory = await subCategoryModel.create({
    name,
    slug: slugify(name, { lower: true }),
    image: {
      secure_url,
      public_id,
    },
    createdBy: req.user.id,
    customId,
    categoryId: category._id,
  });

  req.data = { model: subCategoryModel, _id: newSubCategory._id };

  res.status(200).json({ status: "success", newSubCategory });
});

export const getSubCategories = asyncHandler(async (req, res, next) => {
  const apiFeatures = new ApiFeatures(subCategoryModel.find(), req.query)
    .pagination()
    .filter()
    .sort()
    .select()
    .search();

  const subCategories = await apiFeatures.mongooseQuery;

  !subCategories
    ? next(new AppError("Failed to get subCategories", 500))
    : res
        .status(201)
        .json({ status: "success", page: apiFeatures.page, subCategories });
});

export const getSpecificSubCategory = asyncHandler(async (req, res, next) => {
  const { _id } = req.params;

  const subCategory = await subCategoryModel
    .findOne({ _id })
    .populate("categoryId");

  !subCategory
    ? next(new AppError("Sub category not found", 404))
    : res.status(200).json(subCategory);
});

export const updateSubCategory = asyncHandler(async (req, res, next) => {
  const { _id } = req.params;
  const { name } = req.body;

  const subCategory = await subCategoryModel
    .findOne({
      _id,
      createdBy: req.user._id,
    })
    .populate("categoryId");

  if (!subCategory) next(new AppError("SubCategory not found", 404));

  if (name) {
    if (name.toLowerCase() === subCategory.name)
      return next(new AppError("Name should be different", 400));
    if (await subCategoryModel.findOne({ name: name.toLowerCase() }))
      return next(new AppError("Name is used", 409));

    subCategory.name = name.toLowerCase();
    subCategory.slug = slugify(name, { lower: true });
  }

  if (req.file) {
    await cloudinary.uploader.destroy(subCategory.image.public_id);

    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `e-commerce-app/categories/${subCategory.categoryId.customId}/subCategories/${subCategory.customId}`,
      }
    );

    subCategory.image = {
      secure_url,
      public_id,
    };
  }

  await subCategory.save();

  res.status(200).json({ status: "success", subCategory });
});

export const deleteSubCategory = asyncHandler(async (req, res, next) => {
  const { _id } = req.params;

  const subCategory = await subCategoryModel
    .findOneAndDelete({
      _id,
      createdBy: req.user._id,
    })
    .populate("categoryId");

  if (!subCategory) next(new AppError("SubCategory not found", 404));

  await cloudinary.api.delete_resources_by_prefix(
    `e-commerce-app/categories/${subCategory.categoryId.customId}/subCategories/${subCategory.customId}`
  );

  await cloudinary.api.delete_folder(
    `e-commerce-app/categories/${subCategory.categoryId.customId}/subCategories/${subCategory.customId}`
  );

  res.status(200).json({
    status: "success",
    message: `${subCategory.name} deleted successfully`,
  });
});
