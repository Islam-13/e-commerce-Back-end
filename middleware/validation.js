import AppError from "../src/utils/appError.js";

const dataKeys = ["body", "params", "query", "headers"];

const validation = (schema) => {
  return (req, res, next) => {
    let errorsArr = [];

    dataKeys.forEach((key) => {
      if (schema[key]) {
        const { error } = schema[key].validate(req[key], { abortEarly: false });

        if (error?.details) {
          error.details.forEach((detail) => {
            errorsArr.push(detail.message);
          });
        }
      }
    });

    errorsArr.length ? next(new AppError(errorsArr)) : next();
  };
};

export default validation;
