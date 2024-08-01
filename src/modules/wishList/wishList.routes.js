import { Router } from "express";
import * as WC from "./wishList.controller.js";
import * as WV from "./wishList.validate.js";
import auth from "../../../middleware/auth.js";
import { generalFields, systemRoles } from "../../utils/helpers.js";
import validation from "../../../middleware/validation.js";

const router = Router({ mergeParams: true });

router.post(
  "/",
  auth(Object.values(systemRoles)),
  validation(WV.createWishList),
  WC.createWishList
);

export default router;
