import { Router } from "express";
import * as SCC from "./subCategories.controller.js";
import * as SCV from "./subCategories.validate.js";
import auth from "../../../middleware/auth.js";
import { generalFields, systemRoles } from "../../utils/helpers.js";
import multerHost, { validExtension } from "../../../middleware/multerHost.js";
import validation from "../../../middleware/validation.js";

const router = Router({ mergeParams: true });

router.post(
  "/",
  auth([systemRoles.admin]),
  multerHost(validExtension.image).single("image"),
  validation(SCV.createSubCategory),
  SCC.createSubCategory
);

router.get("/", SCC.getSubCategories);

router.get(
  "/:_id",
  validation(generalFields.params),
  SCC.getSpecificSubCategory
);

router.put(
  "/:_id",
  auth([systemRoles.admin]),
  multerHost(validExtension.image).single("image"),
  validation(SCV.updateSubCategory),
  SCC.updateSubCategory
);

router.delete(
  "/:_id",
  auth([systemRoles.admin]),
  validation(generalFields.params),
  SCC.deleteSubCategory
);

export default router;
