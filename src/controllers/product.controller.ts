import { Request, Response } from "express";
import { AppDataSource } from "../config/datasource";
import { Product } from "../entities/Product";
import cloudinary from "../config/cloudinary";
import { url } from "inspector";

const productRepo = AppDataSource.getRepository(Product);

// Get all products
export const getProducts = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const products = await productRepo.find();
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products", error: err });
  }
};

// Get a single product by ID
export const getProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const product = await productRepo.findOneBy({
      id: parseInt(req.params.id),
    });
    if (!product) {
      res.status(404).json({ message: "Product not found" });
    } else {
      res.json(product);
    }
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch product", error: err });
  }
};

// Create a new product
export const createProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { sku, name, price } = req.body;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      res.status(400).json({ message: "At least one image is required" });
      return;
    }

    const uploadResults = await Promise.all(
      files.map((file) => {
        return new Promise<{ secure_url: string; public_id: string }>(
          (resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { resource_type: "image" },
              (err, result) => {
                if (err || !result) reject(err);
                else
                  resolve({
                    secure_url: result.secure_url,
                    public_id: result.public_id,
                  });
              }
            );
            stream.end(file.buffer);
          }
        );
      })
    );

    const images = uploadResults.map(({ secure_url, public_id }) => ({
      url: secure_url,
      public_id,
    }));

    const product = productRepo.create({ sku, name, price, images });
    await productRepo.save(product);

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: "Error creating product", error: err });
  }
};

// Update a product
export const updateProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    console.log(id);
    
    if (isNaN(id)) {
      res.status(400).json({ message: "Invalid product ID" });
      return;
    }

    const { name, price } = req.body;
    console.log(name, price);
    
    const product = await productRepo.findOneBy({ id });

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    const files = req.files as Express.Multer.File[] | undefined;

    if (files && files.length > 0) {
      if (product.images?.length) {
        await Promise.all(
          product.images.map((img) =>
            cloudinary.uploader.destroy(img.public_id)
          )
        );
      }

      const uploadResults = await Promise.all(
        files.map(
          (file) =>
            new Promise<{ secure_url: string; public_id: string }>(
              (resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                  { resource_type: "image" },
                  (err, result) => {
                    if (err || !result) reject(err);
                    else
                      resolve({
                        secure_url: result.secure_url,
                        public_id: result.public_id,
                      });
                  }
                );
                stream.end(file.buffer);
              }
            )
        )
      );

      product.images = uploadResults.map(({ secure_url, public_id }) => ({
        url: secure_url,
        public_id,
      }));
    }

    product.name = name ?? product.name;
    product.price = price ?? product.price;

    await productRepo.save(product);
    res.json(product);
  } catch (err) {
    console.error("Update product error:", err);
    res.status(500).json({ message: "Error updating product", error: err });
  }
};

// Delete a product
export const deleteProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const product = await productRepo.findOneBy({
      id: parseInt(req.params.id),
    });

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    if (product.images && product.images.length > 0) {
      await Promise.all(
        product.images.map((img) => cloudinary.uploader.destroy(img.public_id))
      );
    }

    await productRepo.remove(product);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting product", error: err });
  }
};
