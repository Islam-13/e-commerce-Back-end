import { Router } from "express";
import * as OC from "./orders.controller.js";
import * as OV from "./orders.validate.js";
import auth from "../../../middleware/auth.js";
import { systemRoles } from "../../utils/helpers.js";
import validation from "../../../middleware/validation.js";

const router = Router();

router.post(
  "/",
  auth(Object.values(systemRoles)),
  validation(OV.createOrder),
  OC.createOrder
);

router.put(
  "/:_id",
  auth(Object.values(systemRoles)),
  validation(OV.cancelOrder),
  OC.cancelOrder
);

export default router;
