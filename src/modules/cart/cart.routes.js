import { Router } from "express";
import * as CC from "./cart.controller.js";
import * as CV from "./cart.validate.js";
import auth from "../../../middleware/auth.js";
import { systemRoles } from "../../utils/helpers.js";
import validation from "../../../middleware/validation.js";

const router = Router();

router.post(
  "/",
  auth(Object.values(systemRoles)),
  validation(CV.createCart),
  CC.createCart
);

router.put("/:productId", auth(Object.values(systemRoles)), CC.removeProduct);

router.put("/", auth(Object.values(systemRoles)), CC.clearCart);

router.delete("/:_id", auth(Object.values(systemRoles)), CC.deleteCart);

export default router;
