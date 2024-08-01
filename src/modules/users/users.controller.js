import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { customAlphabet } from "nanoid";
import userModel from "../../../db/models/user.model.js";
import AppError from "../../utils/appError.js";
import sendEmail from "../../services/sendEmail.js";
import { asyncHandler } from "../../utils/helpers.js";

export const signup = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;
  // 1-check email in db
  const emailExist = await userModel.findOne({ email: email.toLowerCase() });
  if (emailExist) return next(new AppError("Email already exists", 409));

  // 2-send confirmation mail
  const token = jwt.sign(
    { email: email.toLowerCase() },
    process.env.signupKey,
    { expiresIn: 60 * 60 * 3 }
  );
  const resendToken = jwt.sign(
    { email: email.toLowerCase() },
    process.env.signupKey
  );
  const html = `
        <h2>Hello ${name},</h2>
        <p>Please confirm your email through the link below</p>
        <a href="${req.protocol}://${req.headers.host}/users/confirm/${token}">confirm email</a>
        <br>
        <a href="${req.protocol}://${req.headers.host}/users/resend/${resendToken}">Resend Confirmation Email</a>
  `;

  const checkEmail = await sendEmail(email, "confirm email", html);
  if (!checkEmail) return next(new AppError("Error sending email", 500));

  // 3-hash password and create user
  const hashed = bcrypt.hashSync(password, parseInt(process.env.saltRounds));

  const user = await userModel.create({ ...req.body, password: hashed });

  !user
    ? next(new AppError("Error creating user", 500))
    : res.status(200).json(user);
});

export const confirmEmail = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const email = jwt.decode(token, process.env.signupKey)?.email;

  if (!email) return next(new AppError("Inavlid token", 401));

  const user = await userModel.findOneAndUpdate(
    { email, confirmed: false },
    { confirmed: true },
    { new: true }
  );

  !user
    ? next(new AppError("Email is not correct or already confirmed", 400))
    : res.status(200).json(user);
});

export const resendEmail = asyncHandler(async (req, res, next) => {
  const { resendToken } = req.params;
  const email = jwt.decode(resendToken, process.env.signupKey)?.email;

  if (!email) return next(new AppError("Inavlid token", 401));

  const user = await userModel.findOne({ email, confirmed: true });
  if (user) return next(new AppError("Email already confirmed", 400));

  const token = jwt.sign({ email }, process.env.signupKey, {
    expiresIn: 60 * 60 * 3,
  });

  const html = `
        <p>Please confirm your email through the link below</p>
        <a href="${req.protocol}://${req.headers.host}/users/confirm/${token}">confirm email</a>
  `;

  const checkEmail = await sendEmail(email, "confirm email", html);
  if (!checkEmail) return next(new AppError("Error sending email", 500));

  res
    .status(200)
    .json({ status: "success", message: "Email resent successfully" });
});

export const forgetPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await userModel.findOne({ email: email.toLowercase() });
  if (!user) return next(new AppError("Email is not exist", 404));

  const code = customAlphabet("0123456789", 6);
  const otp = code();
  const html = `<h3>Your password reset code is ${otp}</h3>`;

  const checkEmail = await sendEmail(email, "Reset password code", html);
  if (!checkEmail) return next(new AppError("Error sending email", 500));

  user.otp = otp;
  await user.save();

  res.status(200).json({ status: "success", message: "OTP sent successfully" });
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  const { email, otp, password } = req.body;

  const user = await userModel.findOne({ email: email.toLowerCase(), otp });
  if (!user || !otp) return next(new AppError("OTP is not correct", 400));

  const hashed = bcrypt.hashSync(password, parseInt(process.env.saltRounds));
  user.password = hashed;
  user.otp = "";
  user.passwordChangedAt = Date.now();
  await user.save();

  res
    .satus(200)
    .json({ status: "success", message: "Password reset successfully" });
});

export const signin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email: email.toLowerCase() });
  if (!user || !bcrypt.compareSync(password, user.password))
    return next(new AppError("Email or password is not correct", 401));

  if (!user.confirmed) return next(new AppError("Email is not confirmed", 400));

  const token = jwt.sign(
    { email: email.toLowerCase(), id: user._id },
    process.env.signinKey,
    { expiresIn: 60 * 60 * 3 }
  );

  user.loggedin = true;
  await user.save();

  res.status(200).json({ status: "success", token });
});
