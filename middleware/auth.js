import userModel from "../db/models/user.model.js";
import AppError from "../src/utils/appError.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../src/utils/helpers.js";

const auth = (roles = []) => {
  return asyncHandler(async (req, res, next) => {
    const { token } = req.headers;

    if (!token) return next(new AppError("No token provided", 401));

    if (!token.startsWith(process.env.bearerKey))
      return next(new AppError("Bearer is not correct", 401));

    const newToken = token.split(process.env.bearerKey)[1];

    if (!newToken) return next(new AppError("Token is not valid", 401));

    const decoded = jwt.verify(newToken, process.env.signinKey);

    if (!decoded?.id) return next(new AppError("Invalid token", 401));

    const user = await userModel.findById(decoded.id);

    if (!user) return next(new AppError("User not found", 404));

    if (!user.loggedin) return next(new AppError("Please login", 401));

    if (!roles.includes(user.role))
      return next(new AppError("You are not authorized", 403));

    if (parseInt(user?.passwordChangedAt?.getTime() / 1000) > decoded.iat)
      return next(new AppError("Token is expired", 401));

    req.user = user;
    next();
  });
};

export default auth;
