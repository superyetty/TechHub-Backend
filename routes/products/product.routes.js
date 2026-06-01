import express from "express";
import {
  create,
  getProductById,
  getAllProducts,
  updateProductById,
  deleteProductById,
} from "../../controllers/products/products.controller.js"

const productRouter = express.Router();

productRouter.post("/create-product", create);
productRouter.get("/product/:id", getProductById);
productRouter.get("/products", getAllProducts);
productRouter.put("/update-product/:id", updateProductById);
productRouter.delete("/delete-product/:id", deleteProductById);

export default productRouter;
