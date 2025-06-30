import { DataSource } from "typeorm";
import { Product } from "../entities/Product";
import dotenvx from "@dotenvx/dotenvx";

dotenvx.config({
  path:
    process.env.NODE_ENV === "production"
      ? ".env.production"
      : ".env.development",
});

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || "3306"),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  synchronize: true,
  logging: false,
  entities: [Product],
  ssl: {
    rejectUnauthorized: process.env.NODE_ENV === "production" ? true : false, // Enforce certificate validation
  },
});
