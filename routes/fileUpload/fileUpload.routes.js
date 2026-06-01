import express from "express";
import fileUpload from "../../controllers/fileUpload/fileUpload.js";
import upload from "../../config/multer.js";

const fileRouter = express.Router();

fileRouter.post("/upload", upload.array("files", 10), fileUpload);

export default fileRouter;
