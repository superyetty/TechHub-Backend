import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import dbURI from "./config/db.js";

import adminRoutes from "./routes/admin/auth.routes.js";
import userRouter from "./routes/user/user.routes.js";
import productRouter from "./routes/products/product.routes.js";
import cartRouter from "./routes/cart/cart.routes.js";
import fileRouter from "./routes/fileUpload/fileUpload.routes.js";
import orderRouter from "./routes/orders/orders.routes.js";
import messageRouter from "./routes/messages/messages.routes.js";
import wishlistRouter from "./routes/wishlist/wishlist.routes.js";
import checkoutRouter from "./routes/checkout/checkout.routes.js";
import paymentRouter from "./routes/payment/payment.routes.js";

dotenv.config();
const app = express();
dbURI();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:5175",
  "http://localhost:5174",
  ...(process.env.FRONTEND_URLS
    ? process.env.FRONTEND_URLS.split(",").map((origin) => origin.trim())
    : []),
];

const isAllowedOrigin = (origin) => {
  if (!origin) {
    return true;
  }

  if (allowedOrigins.includes(origin)) {
    return true;
  }

  return /^https:\/\/.+\.vercel\.app$/.test(origin);
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["POST", "GET", "PUT", "DELETE"],
    credentials: true,
  }),
);

app.use(morgan("dev"));
app.use("/api", adminRoutes);
app.use("/api", userRouter);
app.use("/api", productRouter);
app.use("/api", cartRouter);
app.use("/api", fileRouter);
app.use("/api", orderRouter);
app.use("/api", messageRouter);
app.use("/api", wishlistRouter);
app.use("/api", checkoutRouter);
app.use("/api/payment", paymentRouter);

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
