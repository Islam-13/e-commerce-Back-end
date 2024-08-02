import { Router } from "express";
import * as PC from "./products.controller.js";
import * as PV from "./products.validate.js";
import auth from "../../../middleware/auth.js";
import { systemRoles } from "../../utils/helpers.js";
import multerHost, { validExtension } from "../../../middleware/multerHost.js";
import validation from "../../../middleware/validation.js";
import reviewsRouter from "../reviews/reviews.routes.js";
import wishListRouter from "../wishList/wishList.routes.js";

const router = Router();

router.use("/:productId/reviews", reviewsRouter);
router.use("/:productId/wishList", wishListRouter);

router.post(
  "/",
  auth([systemRoles.admin]),
  multerHost(validExtension.image).fields([
    { name: "image", maxCount: 1 },
    { name: "coverImages", maxCount: 5 },
  ]),
  validation(PV.createProduct),
  PC.createProduct
);

router.get("/", PC.getProducts);

router.get("/:_id", PC.getProduct);

router.delete("/:_id", auth([systemRoles.admin]), PC.deleteProduct);

router.put(
  "/:_id",
  auth([systemRoles.admin]),
  multerHost(validExtension.image).fields([
    { name: "image", maxCount: 1 },
    { name: "coverImages", maxCount: 5 },
  ]),
  validation(PV.updateProduct),
  PC.updateProduct
);

export default router;
