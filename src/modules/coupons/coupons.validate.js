import joi from "joi";

export const createCoupon = {
  body: joi
    .object({
      code: joi.string().min(3).max(15).required(),
      amount: joi.number().min(1).max(100).required(),
      startDate: joi.date().greater(Date.now()).required(),
      endDate: joi.date().greater(joi.ref("startDate")).required(),
    })
    .required(),
};

export const updateCoupon = {
  body: joi.object({
    code: joi.string().min(3).max(15),
    amount: joi.number().min(1).max(100),
    startDate: joi.date().greater(Date.now()),
    endDate: joi.date().greater(joi.ref("startDate")),
  }),
};
