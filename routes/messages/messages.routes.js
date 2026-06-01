import express from "express";
import { create } from "../../controllers/messages/messages.controller.js";

const messageRouter = express.Router();

messageRouter.post("/user/message", create);

export default messageRouter;
