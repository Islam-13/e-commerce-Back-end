import { Router } from "express";
import * as UC from "./users.controller.js";
import * as UV from "./users.validate.js";
import validation from "../../../middleware/validation.js";

const router = Router();

router.post("/signup", validation(UV.signup), UC.signup);
router.post("/signin", validation(UV.signin), UC.signin);
router.get("/confirm/:token", UC.confirmEmail);
router.get("/resend/:resendToken", UC.resendEmail);
router.post(
  "/forgetPassword",
  validation(UV.forgetPassword),
  UC.forgetPassword
);
router.post("/resetPassword", validation(UV.resetPassword), UC.resetPassword);

export default router;
