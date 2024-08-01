import { Router } from "express";
import auth from "../../../middleware/auth.js";
import { systemRoles } from "../../utils/helpers.js";
import * as CC from "./coupons.controller.js";
import * as CV from "./coupons.validate.js";
import validation from "../../../middleware/validation.js";

const router = Router();

router.post(
  "/",
  auth([systemRoles.admin]),
  validation(CV.createCoupon),
  CC.createCoupon
);

router.get("/", auth(Object.values(systemRoles)), CC.getCoupons);

router.get("/:_id", auth(Object.values(systemRoles)), CC.getCoupon);

router.delete("/:_id", auth([systemRoles.admin]), CC.deleteCoupon);

router.put(
  "/:_id",
  auth([systemRoles.admin]),
  validation(CV.updateCoupon),
  CC.updateCoupon
);

export default router;
