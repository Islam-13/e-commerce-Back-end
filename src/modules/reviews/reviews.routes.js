import { Router } from "express";
import * as RC from "./reviews.controller.js";
import * as RV from "./reviews.validate.js";
import auth from "../../../middleware/auth.js";
import { systemRoles } from "../../utils/helpers.js";
import validation from "../../../middleware/validation.js";

const router = Router({ mergeParams: true });

router.post(
  "/",
  auth(Object.values(systemRoles)),
  validation(RV.createReview),
  RC.createReview
);

router.get("/", RC.getProductReviews);

router.delete(
  "/:_id",
  auth(Object.values(systemRoles)),
  validation(RV.deleteReview),
  RC.deleteReview
);

export default router;
