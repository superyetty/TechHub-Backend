import express from "express";

import {
  createWishlist,
  getWishlist,
  deleteWishlist,
} from "../../controllers/wishlist/wishlist.controller.js";
import protect from "../../middleware/auth.middleware.js";

const wishlistRouter = express.Router();

wishlistRouter.post("/add-wishlist", protect, createWishlist);
wishlistRouter.get("/wishlists", protect, getWishlist);
wishlistRouter.delete("/delete-wishlist", protect, deleteWishlist);

export default wishlistRouter
