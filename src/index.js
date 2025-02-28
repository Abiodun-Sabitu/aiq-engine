import express from "express"; //nodejs framework for handling routes and api
import dotenv from "dotenv"; // loads env into the project
import cors from "cors"; // enables cross origin resource sharing so the frontend can handshake the backend seamlessly
import helmet from "helmet"; // adds security headers to prevent common vulnerabilities
import morgan from "morgan"; // helps to log HTTP requests for debugging

// load envs
dotenv.config();

//initialize express app
const app = express();

//assign middlewares to be used by Express app
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
