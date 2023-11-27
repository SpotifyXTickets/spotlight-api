import express, { Application, Request, Response } from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
//Import Swagger UI and the generated Swagger documentation options.
import swaggerUi from "swagger-ui-express";
import swaggerDocs from "./docs"; // Adjust the path as per our project structure
import routes from "./routes";
import { DB } from "./db/db";
dotenv.config();

const app: Application = express();

app.use(bodyParser.json());
app.use(
  cors({
    origin: `${process.env.FRONTEND_ORIGIN || "http://localhost:3000"}`,
  })
);
app.use(bodyParser.urlencoded({ extended: true }));

// Serve Swagger documentation at /swagger.json
app.get("/swagger.json", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerDocs);
});

// Serve Swagger UI at /api-docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Your existing API routes
app.use("/", routes);

const PORT = process.env.NODE_PORT || 8000;
DB.connect();

app.listen(PORT, () => {
  console.log(`Server is running on PORT http://localhost:${PORT}/`);
});
