import express from "express";
import {
  register,
  login,
  getUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  refreshRoute,
  logout,
} from "../../controllers/user/user.contoller.js";
import protect from "../../middleware/auth.middleware.js";

const userRouter = express.Router();
userRouter.post("/user/register", register);
userRouter.post("/user/login", login);
userRouter.get("/users", getUsers);
userRouter.get("/user/protect", protect);
userRouter.get("/user/refresh-token", refreshRoute);
userRouter.get("/user/profile/:id", protect, getUserById);
userRouter.put("/user/update/:id", protect, updateUserById);
userRouter.delete("/delete-user/:id", protect, deleteUserById);
userRouter.delete("/user/logout", protect, logout);

export default userRouter;
