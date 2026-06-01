import express from "express";
import {
  create,
  getCartById,
  getAllCarts,
  updateCartById,
  deleteCartById,
  deleteCartItemById,
} from "../../controllers/cart/cart.controller.js";

import protect from "../../middleware/auth.middleware.js";

const cartRouter = express.Router();

cartRouter.post("/cart", protect, create);
cartRouter.get("/cart/:id", protect, getCartById);
cartRouter.get("/carts", protect, getAllCarts);
cartRouter.put("/cart/:cartId/product/:productId", protect, updateCartById);
cartRouter.delete("/cart/:id", protect, deleteCartById);
cartRouter.delete("/cart/:cartId/item/:itemId", protect, deleteCartItemById);

export default cartRouter;
