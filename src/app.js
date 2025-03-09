import express from "express"; //nodejs framework for handling routes and api
import dotenv from "dotenv"; // loads env into the project
import cors from "cors"; // enables cross origin resource sharing so the frontend can handshake the backend seamlessly
import helmet from "helmet"; // adds security headers to prevent common vulnerabilities
import morgan from "morgan"; // helps to log HTTP requests for debugging
import db from "./config/db.js";
import routes from "./routes/index.js";
// load envs
dotenv.config();

//initialize express app
const app = express();

//assign middlewares to be used by Express app
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use("/api", routes);

//simple test route
app.get("/", (req, res) => {
  res.send("AIQ Engine Backend is running with ES Modules!");
});

app.get("/test-db", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW() AS current_time");
    res.json({ success: true, time: result.rows[0].current_time });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Database connection failed" });
  }
});

export default app;
