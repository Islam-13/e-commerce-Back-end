import { nanoid } from "nanoid";
import brandModel from "../../../db/models/brand.model.js";
import cloudinary, { ApiFeatures, asyncHandler } from "../../utils/helpers.js";
import slugify from "slugify";
import AppError from "../../utils/appError.js";

export const createBrand = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  const brand = await brandModel.findOne({ name: name.toLowerCase() });
  if (brand) return next(new AppError("Brand already exists", 409));

  if (!req.file) return next(new AppError("image is required", 400));

  const customId = nanoid(5);
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `e-commerce-app/brands/${customId}`,
    }
  );

  req.filePath = `e-commerce-app/brands/${customId}`;

  const newBrand = await brandModel.create({
    name,
    slug: slugify(name, { lower: true }),
    image: { secure_url, public_id },
    createdBy: req.user.id,
    customId,
  });

  req.data = { model: brandModel, _id: newBrand._id };

  res.status(200).json({ status: "success", newBrand });
});

export const updateBrand = asyncHandler(async (req, res, next) => {
  const { _id } = req.params;
  const { name } = req.body;
  const brand = await brandModel.findOne({
    _id,
    createdBy: req.user._id,
  });
  if (!brand) return next(new AppError("Brand not found", 404));

  if (name) {
    if (name.toLowerCase() === brand.name)
      return next(new AppError("Name should be different", 400));
    if (await brandModel.findOne({ name: name.toLowerCase() }))
      return next(new AppError("Name already exists", 409));

    brand.name = name.toLowerCase();
    brand.slug = slugify(name, { lower: true });
  }

  if (req.file) {
    await cloudinary.uploader.destroy(brand.image.public_id);

    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `e-commerce-app/brands/${brand.customId}`,
      }
    );

    brand.image = {
      secure_url,
      public_id,
    };
  }

  await brand.save();
  res.status(200).json({ status: "success", brand });
});

export const getBrands = asyncHandler(async (req, res, next) => {
  const apiFeatures = new ApiFeatures(brandModel.find(), req.query)
    .pagination()
    .filter()
    .sort()
    .select()
    .search();

  const brands = await apiFeatures.mongooseQuery;

  !brands
    ? next(new AppError("Failed to get brands", 500))
    : res
        .status(201)
        .json({ status: "success", page: apiFeatures.page, brands });
});

export const getSpecificBrand = asyncHandler(async (req, res, next) => {
  const { _id } = req.params;

  const brand = await brandModel.findOne({ _id });

  !brand
    ? next(new AppError("Brand is not exists", 404))
    : res.status(200).json(brand);
});

export const deleteBrand = asyncHandler(async (req, res, next) => {
  const { _id } = req.params;

  const brand = await brandModel.findOneAndDelete({
    _id,
    createdBy: req.user._id,
  });

  if (!brand) return next(new AppError("Brand not found", 404));

  await cloudinary.api.delete_resources_by_prefix(
    `e-commerce-app/brands/${brand.customId}`
  );
  await cloudinary.api.delete_folder(`e-commerce-app/brands/${brand.customId}`);

  res
    .status(200)
    .json({ status: "success", message: "Brand deleted successfully" });
});
