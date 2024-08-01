import joi from "joi";

export const signup = {
  body: joi
    .object({
      name: joi.string().min(3).max(15).required(),
      email: joi.string().email().required(),
      password: joi.string().min(6).required(),
      phone: joi.array().items(joi.string().min(10)).required(),
      age: joi.number().integer().required(),
    })
    .required(),
};

export const signin = {
  body: joi
    .object({
      email: joi.string().email().required(),
      password: joi.string().min(6).required(),
    })
    .required(),
};

export const forgetPassword = {
  body: joi.object({
    email: joi.string().email().required(),
  }),
};

export const resetPassword = {
  body: joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(6).required(),
    otp: joi.string().min(6).max(6).required(),
  }),
};
