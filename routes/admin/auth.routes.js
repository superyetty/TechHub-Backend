import express from "express";
import {
  create,
  login,
  updateProdileById,
  getProfileById,
  deleteprofileById,
} from "../../controllers/admin/auth.controllers.js";

const adminRoutes = express.Router();

adminRoutes.post("/admin-register", create);
adminRoutes.get("/admin-login", login);
adminRoutes.put("/admin-update/:id", updateProdileById);
adminRoutes.get("/admin-profile/:id", getProfileById);
adminRoutes.delete("/delete-admin/:id", deleteprofileById);

export default adminRoutes;
