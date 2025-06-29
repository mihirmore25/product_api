import { Router } from "express";
import {
  getProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller";
import { upload } from "../utils/upload"; // This should export configured multer

const router = Router();

// Route Handlers
router.get("/", getProducts);
router.get("/:id", getProduct);
router.post("/", upload.array("images"), createProduct);
router.put("/:id", upload.array("images"), updateProduct);
router.delete("/:id", deleteProduct);

export default router;
