import { nanoid } from "nanoid";
import slugify from "slugify";
import productModel from "../../../db/models/product.model.js";
import AppError from "../../utils/appError.js";
import cloudinary, { ApiFeatures, asyncHandler } from "../../utils/helpers.js";
import categoryModel from "../../../db/models/category.model.js";
import subCategoryModel from "../../../db/models/subCategory.model.js";
import brandModel from "../../../db/models/brand.model.js";

export const createProduct = asyncHandler(async (req, res, next) => {
  const { title, categoryId, subCategoryId, brandId, price, discount } =
    req.body;

  const category = await categoryModel.findById(categoryId);
  if (!category) return next(new AppError("Category is not exists", 404));

  const subCategory = await subCategoryModel.findOne({
    _id: subCategoryId,
    categoryId,
  });
  if (!subCategory) return next(new AppError("SubCategory is not exists", 404));

  const brand = await brandModel.findById(brandId);
  if (!brand) return next(new AppError("Brand is not exists", 404));

  const product = await productModel.findOne({ name: title.toLowerCase() });
  if (product)
    return next(new AppError(`Product with name ${title} already exists`, 400));

  const subPrice = price - price * ((discount || 0) / 100);

  if (!req.files) return next(new AppError("images are required", 400));

  const customId = nanoid(5);
  const imagesArr = [];
  for (const file of req.files.coverImages) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      file.path,
      {
        folder: `e-commerce-app/categories/${category.customId}/subCategories/${subCategory.customId}/products/${customId}/coverImages`,
      }
    );

    imagesArr.push({ secure_url, public_id });
  }

  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.files.image[0].path,
    {
      folder: `e-commerce-app/categories/${category.customId}/subCategories/${subCategory.customId}/products/${customId}/mainImage`,
    }
  );

  req.filePath = `e-commerce-app/categories/${category.customId}/subCategories/${subCategory.customId}/products/${customId}`;

  const newProduct = await productModel.create({
    ...req.body,
    subPrice,
    customId,
    image: { secure_url, public_id },
    coverImage: imagesArr,
    slug: slugify(title, { lower: true }),
    createdBy: req.user._id,
  });

  req.data = { model: productModel, _id: newProduct._id };

  res.status(201).json({ status: "success", newProduct });
});

export const getProducts = asyncHandler(async (req, res, next) => {
  const apiFeatures = new ApiFeatures(productModel.find(), req.query)
    .pagination()
    .filter()
    .sort()
    .select()
    .search();

  const products = await apiFeatures.mongooseQuery;

  !products
    ? next(new AppError("Failed to get products", 500))
    : res
        .status(201)
        .json({ status: "success", page: apiFeatures.page, products });
});

export const getProduct = asyncHandler(async (req, res, next) => {
  const { _id } = req.params;

  const product = await productModel.findById(_id);

  !product
    ? next(new AppError("Product not found", 404))
    : res.status(200).json({ status: "success", product });
});

export const deleteProduct = asyncHandler(async (req, res, next) => {
  const { _id } = req.params;

  const product = await productModel.findOneAndDelete({
    _id,
    createdBy: req.user._id,
  });

  !product
    ? next(new AppError("Product not found", 404))
    : res
        .status(200)
        .json({ status: "success", message: "Product deleted successfully" });
});

export const updateProduct = asyncHandler(async (req, res, next) => {
  const { _id } = req.params;
  const {
    title,
    description,
    stock,
    price,
    discount,
    categoryId,
    subCategoryId,
    brandId,
  } = req.body;

  const category = await categoryModel.findOne({ _id: categoryId });
  if (!category) next(new AppError("category not found", 404));

  const subCategory = await subCategoryModel.findOne({ _id: subCategoryId });
  if (!subCategory) next(new AppError("subCategory not found", 404));

  const brand = await brandModel.findOne({ _id: brandId });
  if (!brand) next(new AppError("brand not found", 404));

  const product = await productModel.findOne({ _id, createdBy: req.user._id });
  if (!product) next(new AppError("Product not found", 404));

  if (title && title !== product.title) {
    const newTittle = await productModel.findOne({
      tittle: title.toLowerCase(),
    });
    if (newTittle)
      return next(new AppError("Product with this name already exists", 409));

    product.title = title;
    product.slug = slugify(title, { lower: true });
  }

  if (description) product.description = description;

  if (stock) product.stock = stock;

  if (price && discount) {
    product.subPrice = price - price * ((discount || 0) / 100);
    product.price = price;
    product.discount = discount;
  } else if (price) {
    product.subPrice = price - price * ((product.discount || 0) / 100);
    product.price = price;
  } else if (discount) {
    product.subPrice = product.price - product.price * ((discount || 0) / 100);
    product.discount = discount;
  }

  if (req.files.image) {
    await cloudinary.uploader.destroy(product.image.public_id);

    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.files.image[0].path,
      {
        folder: `e-commerce-app/categories/${category.customId}/subCategories/${subCategory.customId}/products/${product.customId}/mainImage`,
      }
    );

    product.image = { secure_url, public_id };
  }

  if (req.files.coverImages) {
    await cloudinary.api.delete_resources_by_prefix(
      `e-commerce-app/categories/${category.customId}/subCategories/${subCategory.customId}/products/${product.customId}/coverImages`
    );

    await cloudinary.api.delete_folder(
      `e-commerce-app/categories/${category.customId}/subCategories/${subCategory.customId}/products/${product.customId}/coverImages`
    );

    const imagesArr = [];
    for (const file of req.files.coverImages) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        file.path,
        {
          folder: `e-commerce-app/categories/${category.customId}/subCategories/${subCategory.customId}/products/${product.customId}/coverImages`,
        }
      );

      imagesArr.push({ secure_url, public_id });
    }

    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.files.image[0].path,
      {
        folder: `e-commerce-app/categories/${category.customId}/subCategories/${subCategory.customId}/products/${customId}`,
      }
    );

    product.image = { secure_url, public_id };
    product.coverImages = imagesArr;
  }

  await product.save();

  res.status(200).json({
    status: "success",
    message: "Product updated successfully",
    product,
  });
});
