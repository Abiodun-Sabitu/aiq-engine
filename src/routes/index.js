// router.js
import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerDoc from "../config/swagger-output.json" assert { type: "json" }; // Node 18+ required
import authRoutes from "./authRoutes.js";

const router = express.Router();

router.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));
router.use("/auth", authRoutes);

export default router;
