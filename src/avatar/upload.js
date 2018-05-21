import multer from "multer";
import cloudinary from "cloudinary";
import middleware from "./middleware";
import express from "express";

const app = express();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post("/upload", upload.single("file"), middleware);

export default upload;
