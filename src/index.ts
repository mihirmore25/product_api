import dotenvx from "@dotenvx/dotenvx";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { AppDataSource } from "./config/datasource";
import productRoutes from "./routes/product.routes";

dotenvx.config();

const app = express();
// app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));

// Routes should be mounted like this:
app.use("/api/products", productRoutes);

const PORT = process.env.PORT || 5000;

AppDataSource.initialize()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error) => console.error("Error connecting to database", error));
