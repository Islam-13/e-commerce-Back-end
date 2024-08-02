import cors from "cors";
import connectionDB from "../db/connectionDB.js";
import * as router from "./modules/index.routes.js";
import AppError from "./utils/appError.js";
import {
  deleteFromCloudinary,
  deleteFromDb,
  globalErrorHandler,
} from "./utils/helpers.js";

function initApp(app, express) {
  app.use(cors());

  connectionDB();

  app.use((req, res, next) => {
    if (req.originalUrl == "/orders/webhook") {
      next();
    } else express.json()(req, res, next);
  });

  app.get("/", (req, res) =>
    res.status(201).json({ message: "Welcome to e-commerce app." })
  );

  app.use("/users", router.userRouters);
  app.use("/categories", router.categoriesRouter);
  app.use("/subCategories", router.subCategoriesRouter);
  app.use("/brands", router.brandsRouter);
  app.use("/products", router.productsRouter);
  app.use("/coupons", router.couponsRouter);
  app.use("/cart", router.cartRouter);
  app.use("/orders", router.ordersRouter);
  app.use("/reviews", router.reviewsRouter);
  app.use("/wishList", router.wishListRouter);

  app.use("*", (req, res, next) =>
    next(new AppError(`invalid ${req.originalUrl}`, 404))
  );

  app.use(globalErrorHandler, deleteFromCloudinary, deleteFromDb);
}
export default initApp;
