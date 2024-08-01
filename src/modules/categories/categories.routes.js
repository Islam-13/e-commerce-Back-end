import { Router } from "express";
import * as CC from "./categories.controller.js";
import * as CV from "./categories.validate.js";
import multerHost, { validExtension } from "../../../middleware/multerHost.js";
import validation from "../../../middleware/validation.js";
import auth from "../../../middleware/auth.js";
import { paramsId, systemRoles } from "../../utils/helpers.js";
import subCategorirsRouter from "../subCategories/subCategories.routes.js";

const router = Router();

router.use("/:categoryId/subCategories", subCategorirsRouter);

router.post(
  "/",
  auth([systemRoles.admin]),
  multerHost(validExtension.image).single("image"),
  validation(CV.createCategory),
  CC.createCategory
);

router.put(
  "/:_id",
  auth([systemRoles.admin]),
  multerHost(validExtension.image).single("image"),
  validation(CV.updateCategory),
  CC.updateCategory
);

router.get("/", auth(Object.values(systemRoles)), CC.getCategories);

router.get(
  "/:_id",
  auth(Object.values(systemRoles)),
  validation(paramsId),
  CC.getSpecificCategory
);

router.delete(
  "/:_id",
  auth([systemRoles.admin]),
  validation(paramsId),
  CC.deleteCategory
);

export default router;
