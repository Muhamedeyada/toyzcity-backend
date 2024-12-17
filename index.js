const express = require("express");
const { default: mongoose } = require("mongoose");
const errorHandler = require("./middlewares/errorHandler");
const requestLogger = require("./middlewares/requestLogger");
const rateLimiter = require("./utils/rateLimiterConfig");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const cors = require("cors");
require("express-async-errors");

require("dotenv").config();
const DB_URI = process.env.DB_URI;
const PORT = process.env.PORT;

const userRoutes = require("./routes/user.routes");
const itemRoutes = require("./routes/item.routes");
const authRoutes = require("./routes/auth.routes");
const contactUsRoutes = require("./routes/contactUs.routes");
const categoryRoutes = require("./routes/category.routes");
const wishlistRoutes = require("./routes/wishlist.routes");

const UserController = require("./controllers/user.controllers");
const ItemController = require("./controllers/item.controllers");
const AuthController = require("./controllers/auth.controller");
const CategoryController = require("./controllers/category.controller");
const ContactUsController = require("./controllers/contactUs.controller");
const WishlistController = require("./controllers/wishlist.controller");

const UserRepository = require("./repositories/user.repository");
const ItemRepository = require("./repositories/item.repository");
const CategoryRepository = require("./repositories/category.repository");
const ContactUsRepository = require("./repositories/contactUs.repository");
const WishlistRepository = require("./repositories/wishlist.repository");

const userRepository = new UserRepository();
const itemRepository = new ItemRepository();
const categoryRepository = new CategoryRepository();
const contactUsRepository = new ContactUsRepository();
const wishlistRepository = new WishlistRepository();

const userController = new UserController(userRepository);
const itemController = new ItemController(itemRepository);
const authController = new AuthController(userRepository);
const categoryController = new CategoryController(categoryRepository);
const contactUsController = new ContactUsController(contactUsRepository);
const wishlistController = new WishlistController(wishlistRepository);

const app = express();

const mainRouter = express.Router();

app.use(cors());

app.use(rateLimiter());
app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);
app.use(morgan("short"));

mainRouter.use("/users", userRoutes(userController));
mainRouter.use("/items", itemRoutes(itemController));
mainRouter.use("/auth", authRoutes(authController));
mainRouter.use("/categories", categoryRoutes(categoryController));
mainRouter.use("/contact-us", contactUsRoutes(contactUsController));
mainRouter.use("/wishlist", wishlistRoutes(wishlistController));

app.use("/api/v1", mainRouter);

app.use(errorHandler);

mongoose
  .connect(DB_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`server is listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("error connecting to mongodb: " + err.message);
  });
module.exports = app;
