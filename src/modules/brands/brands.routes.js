import { Router } from "express";
import * as BC from "./brands.controller.js";
import * as BV from "./brands.validate.js";
import auth from "../../../middleware/auth.js";
import { generalFields, systemRoles } from "../../utils/helpers.js";
import multerHost, { validExtension } from "../../../middleware/multerHost.js";
import validation from "../../../middleware/validation.js";

const router = Router();

router.post(
  "/",
  auth([systemRoles.admin]),
  multerHost(validExtension.image).single("image"),
  validation(BV.createBrand),
  BC.createBrand
);

router.get("/", BC.getBrands);

router.get("/:_id", validation(generalFields.params), BC.getSpecificBrand);

router.put(
  "/:_id",
  auth([systemRoles.admin]),
  multerHost(validExtension.image).single("image"),
  validation(BV.updateBrand),
  BC.updateBrand
);

router.delete(
  "/:_id",
  auth([systemRoles.admin]),
  validation(generalFields.params),
  BC.deleteBrand
);

export default router;
