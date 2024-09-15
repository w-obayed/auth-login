import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./db/connectDB.js";
import authRouter from "./router/auth.route.js";
import cookieParser from "cookie-parser";

// create server
const app = express();

// dotenv config
dotenv.config();

const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use(express.json());
app.use(cookieParser());

const server = http.createServer(app);

server.setTimeout(30000, () => {
  console.log("Socket timeout occurred!");
});

// create routes api
app.use("/api/v1/auth", authRouter);

// listen server
app.listen(PORT, () => {
  connectDB();
  console.log("Server is running on port: ", PORT);
});
